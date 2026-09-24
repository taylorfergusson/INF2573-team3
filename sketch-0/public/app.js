const button = document.getElementById("go");
const input = document.getElementById("interests");
const results = document.getElementById("results");
const modeNote = document.getElementById("mode");

button.addEventListener("click", async () => {
  button.disabled = true;
  results.innerHTML = "<p>Finding events… (the AI can take 10–30 seconds)</p>";

  try {
    let res;
    try {
      res = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ interests: input.value }),
      });
    } catch {
      throw new Error(
        "Couldn't reach the app's server. Start it with `node server.js`, then open http://localhost:3000."
      );
    }
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `The app's server didn't answer (status ${res.status}). ` +
          "Start it in Terminal with `node server.js` from the sketch-0 folder, " +
          "then open http://localhost:3000 — don't open index.html directly."
      );
    }
    if (data.error) throw new Error(data.error);

    modeNote.textContent =
      data.mode === "ai"
        ? "Matches are picked by an AI model and may be wrong. Events are made-up sample data."
        : "No AI key set: matching by simple keywords, not AI. Events are made-up sample data.";

    if (!data.matches.length) {
      results.innerHTML = "<p>No matching events found. Try different interests.</p>";
      return;
    }

    results.innerHTML = data.matches
      .map(
        (e) => `
        <div class="event">
          <strong>${escape(e.title)}</strong>
          <div class="meta">${escape(e.date)} · ${escape(e.neighbourhood)}</div>
          <div>${escape(e.description)}</div>
          <div class="reason">Why: ${escape(e.reason)}</div>
        </div>`
      )
      .join("");
  } catch (err) {
    results.innerHTML = `<p class="error">${escape(err.message)}</p>`;
  } finally {
    button.disabled = false;
  }
});

function escape(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
