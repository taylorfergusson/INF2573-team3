const button = document.getElementById("go");
const input = document.getElementById("interests");
const results = document.getElementById("results");
const modeNote = document.getElementById("mode");
const originSelect = document.getElementById("origin");
const maxSelect = document.getElementById("max-minutes");
let lastMatches = null; // null until the first search

// Changing where you start from or your limit updates the travel lines without searching again
originSelect.addEventListener("change", render);
maxSelect.addEventListener("change", render);

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
        ? "Matches are picked by an AI model and may be wrong. Events, reviews, organizers, attendees, friends and travel times are made-up sample data."
        : "No AI key set: matching by simple keywords, not AI. Events, reviews, organizers, attendees, friends and travel times are made-up sample data.";

    lastMatches = data.matches;
    render();
  } catch (err) {
    results.innerHTML = `<p class="error">${escape(err.message)}</p>`;
  } finally {
    button.disabled = false;
  }
});

function render() {
  if (!lastMatches) return;
  if (!lastMatches.length) {
    results.innerHTML = "<p>No matching events found. Try different interests.</p>";
    return;
  }
  results.innerHTML = lastMatches
    .map(
      (e) => `
      <div class="event">
        <strong>${escape(e.title)}</strong>
        <div class="meta">${escape(e.date)} · ${escape(e.neighbourhood)}</div>
        ${travelLine(e)}
        <div>${escape(e.description)}</div>
        <div class="reason">Why: ${escape(e.reason)}</div>
        ${socialProof(e)}
        <button class="going" data-id="${escape(e.id)}">I'd go</button>
      </div>`
    )
    .join("");
}

// How hard it is to get there from the chosen starting point
function travelLine(e) {
  if (!e.travel) return "";
  const stop = `near ${escape(e.travel.stop)}`;
  const trip = e.travel.from[originSelect.value];
  if (!trip) return `<div class="travel">🚇 ${stop} · pick a starting point to see travel time</div>`;

  const max = Number(maxSelect.value) || Infinity;
  const over = trip.minutes > max;
  const time = trip.minutes >= 60 ? `${Math.floor(trip.minutes / 60)} h ${trip.minutes % 60} min` : `${trip.minutes} min`;
  const transfers = trip.transfers === 0 ? "no transfers" : `${trip.transfers} transfer${trip.transfers > 1 ? "s" : ""}`;
  const easy = !over && trip.minutes <= 30 && trip.transfers === 0 ? `<span class="badge">Transit-easy</span>` : "";
  const warning = over ? ` · over your ${max} min limit` : "";
  return `<div class="travel${over ? " over" : ""}">🚇 ~${time} · ${transfers} · ${stop}${warning}${easy}</div>`;
}

// "I'd go": log interest so we can measure match quality
results.addEventListener("click", async (ev) => {
  const btn = ev.target.closest("button.going");
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  try {
    const res = await fetch("/api/going", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: Number(btn.dataset.id), interests: input.value }),
    });
    if (!res.ok) throw new Error();
    btn.textContent = "Saved ✓";
  } catch {
    btn.textContent = "Couldn't save, try again";
    btn.disabled = false;
  }
});

// A snippet of reviews (trust) and who's going (belonging)
function socialProof(e) {
  let html = "";
  if (e.reviews && e.reviews.length) {
    const top = [...e.reviews].sort((a, b) => b.rating - a.rating)[0];
    html += `<div class="social">★ ${escape(e.rating)} · “${escape(top.text)}”</div>`;
  }
  if (e.organizer) {
    html += `<div class="social">Organizer: ${escape(e.organizer.name)} ★ ${escape(e.organizer.rating)} · “${escape(e.organizer.review)}”</div>`;
  }
  if (e.going) {
    const friends = e.friends || [];
    // Friends first, then other attendees
    const names = [...friends, ...(e.attendees || []).filter((n) => !friends.includes(n))];
    const others = e.going - names.length;
    if (friends.length) {
      html += `<div class="social friends">Your friend${friends.length > 1 ? "s" : ""} ${friends.map(escape).join(" and ")} ${friends.length > 1 ? "are" : "is"} going</div>`;
    }
    const who = names.length
      ? `${names.map(escape).join(", ")}${others > 0 ? ` and ${others} others` : ""}`
      : `${escape(e.going)} people`;
    html += `<div class="social">${escape(e.going)} going: ${who}</div>`;
  }
  return html;
}

function escape(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
