const button = document.getElementById("go");
const input = document.getElementById("interests");
const results = document.getElementById("results");
const modeNote = document.getElementById("mode");

button.addEventListener("click", async () => {
  button.disabled = true;
  results.innerHTML = "<p>Finding events…</p>";

  try {
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ interests: input.value }),
    });
    const data = await res.json();
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
