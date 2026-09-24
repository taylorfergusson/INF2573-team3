// Sketch 0 — interests in, matching Toronto events out.
// Zero dependencies: needs Node 18+ only. Run with `node server.js`.

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");

// --- Load .env (so the API key never lives in the code) ---
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.MODEL || "claude-haiku-4-5-20251001";
const events = JSON.parse(fs.readFileSync(path.join(__dirname, "events.json"), "utf8"));
const goingLogPath = path.join(__dirname, "going-log.jsonl"); // one line per "I'd go" click

// Is the `claude` command installed? (checked once at startup)
let claudeCodeAvailable = false;
try {
  require("child_process").execFileSync("claude", ["--version"], { stdio: "ignore", timeout: 15000 });
  claudeCodeAvailable = true;
} catch {}

// --- The instructions we give the AI ---
// The team's product strategy lives in strategy.md so it can be edited without touching code.
// Read on every request, so edits apply without restarting the server.
const strategyPath = path.join(__dirname, "strategy.md");
function loadStrategy() {
  try {
    return fs.readFileSync(strategyPath, "utf8").trim();
  } catch {
    console.warn("strategy.md not found — matching without it");
    return "";
  }
}

function buildPrompt(interests) {
  const strategy = loadStrategy();
  return `${strategy ? `You are the event-matching step of our app. Our product strategy is below; let it guide which events you pick and how you explain them.
<strategy>
${strategy}
</strategy>

` : ""}A person in Toronto described their interests as:
"${interests}"

Here is a list of upcoming events (JSON):
${JSON.stringify(events)}

Pick the 5 events that best match their interests. For each, write one short, specific sentence explaining why it matches.
Each event's "friends" field lists this person's friends who are going, and "organizer" has the organizer's rating and a review.
Where it helps, work in a detail from the event or organizer reviews, or who's going, especially friends (e.g. "your friend Priya is going, and reviewers say beginners never feel out of place").
Only use reviews, organizer and attendee details that appear in the event data; never invent any.
Only choose from the list. If fewer than 5 are a genuine fit, return fewer.
Respond with JSON only, no other text, in this shape:
{"matches": [{"id": <event id>, "reason": "<one sentence>"}]}`;
}

// Turn the AI's text answer into full event objects
function parseMatches(text) {
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  return json.matches
    .map((m) => ({ ...events.find((e) => e.id === m.id), reason: m.reason }))
    .filter((e) => e.title);
}

// --- Option A (default): ask Claude Code, using your Claude subscription ---
function matchWithClaudeCode(interests) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      "claude",
      ["-p", buildPrompt(interests), "--output-format", "json"],
      { cwd: os.tmpdir(), timeout: 120000, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        let out = null;
        try {
          out = JSON.parse(stdout);
        } catch {}

        if (err || (out && out.is_error)) {
          if (err && err.code === "ENOENT") claudeCodeAvailable = false;
          // Show the real reason, not just the first warning line
          const cleanStderr = (stderr || "")
            .split("\n")
            .filter((l) => l.trim() && !l.includes("no stdin data received"))
            .join(" ");
          const reason =
            (out && out.result) ||
            cleanStderr ||
            (stdout || "").trim() ||
            (err && err.killed ? "it took longer than 2 minutes" : err && err.message) ||
            "unknown error";
          console.error("Claude Code error details:", { code: err && err.code, stdout, stderr });
          return reject(new Error(`Claude Code failed: ${reason}`));
        }
        try {
          resolve(parseMatches(out && typeof out.result === "string" ? out.result : stdout));
        } catch {
          reject(new Error("The AI's answer wasn't in the expected format. Try again."));
        }
      }
    );
    // Close stdin so Claude Code doesn't wait for piped input
    child.stdin.end();
  });
}

// --- Option B: call the Anthropic API directly (only if a key is in .env) ---
async function matchWithAPI(interests) {
  const prompt = buildPrompt(interests);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const text = data.content.map((c) => c.text || "").join("");
  return parseMatches(text);
}

// --- Fallback when there's no API key: plain keyword overlap (NOT AI) ---
function matchWithKeywords(interests) {
  const words = interests.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  return events
    .map((e) => {
      const hay = `${e.title} ${e.description} ${e.tags.join(" ")}`.toLowerCase();
      const hits = words.filter((w) => hay.includes(w));
      return { ...e, score: hits.length, reason: hits.length ? `Mentions: ${hits.join(", ")}` : "" };
    })
    .filter((e) => e.score > 0)
    // Ties go to events with friends going, then better-reviewed, then busier ones
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.friends || []).length - (a.friends || []).length ||
        (b.rating || 0) - (a.rating || 0) ||
        (b.going || 0) - (a.going || 0)
    )
    .slice(0, 5);
}

// --- Tiny web server ---
const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/match") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { interests } = JSON.parse(body || "{}");
        if (!interests || !interests.trim()) throw new Error("Please enter some interests.");
        let mode, matches;
        if (API_KEY) {
          mode = "ai";
          matches = await matchWithAPI(interests);
        } else if (claudeCodeAvailable) {
          mode = "ai";
          matches = await matchWithClaudeCode(interests);
        } else {
          mode = "keywords";
          matches = matchWithKeywords(interests);
        }
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ mode, matches }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // "I'd go" clicks: a first signal for our north star (events people would attend)
  if (req.method === "POST" && req.url === "/api/going") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { id, interests } = JSON.parse(body || "{}");
        const event = events.find((e) => e.id === id);
        if (!event) throw new Error("Unknown event.");
        const entry = { time: new Date().toISOString(), eventId: id, title: event.title, interests: String(interests || "") };
        fs.appendFileSync(goingLogPath, JSON.stringify(entry) + "\n");
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  const file = req.url === "/" ? "index.html" : req.url.replace(/^\/+/, "");
  const filePath = path.join(__dirname, "public", path.normalize(file));
  if (!filePath.startsWith(path.join(__dirname, "public")) || !fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end("Not found");
  }
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
  res.writeHead(200, { "content-type": types[path.extname(filePath)] || "text/plain" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Sketch 0 running at http://localhost:${PORT}`);
  if (API_KEY) console.log(`Matching with AI via the Anthropic API (${MODEL})`);
  else if (claudeCodeAvailable) console.log("Matching with AI via Claude Code (your Claude subscription)");
  else console.log("Claude Code not found and no API key — using keyword matching (not AI)");
});
