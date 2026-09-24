// Sketch 0 — interests in, matching Toronto events out.
// Zero dependencies: needs Node 18+ only. Run with `node server.js`.

const http = require("http");
const fs = require("fs");
const path = require("path");

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

// --- AI matching: send interests + event list to the model ---
async function matchWithAI(interests) {
  const prompt = `A person in Toronto described their interests as:
"${interests}"

Here is a list of upcoming events (JSON):
${JSON.stringify(events)}

Pick the 5 events that best match their interests. For each, write one short, specific sentence explaining why it matches.
Only choose from the list. If fewer than 5 are a genuine fit, return fewer.
Respond with JSON only, no other text, in this shape:
{"matches": [{"id": <event id>, "reason": "<one sentence>"}]}`;

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
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  return json.matches
    .map((m) => ({ ...events.find((e) => e.id === m.id), reason: m.reason }))
    .filter((e) => e.title);
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
    .sort((a, b) => b.score - a.score)
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
        const mode = API_KEY ? "ai" : "keywords";
        const matches = API_KEY ? await matchWithAI(interests) : matchWithKeywords(interests);
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
  console.log(API_KEY ? `Matching with AI (${MODEL})` : "No ANTHROPIC_API_KEY found — using keyword matching (not AI)");
});
