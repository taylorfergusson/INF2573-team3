// Sketch 1 database: one JSON file (data/db.json), started from the files in seed/.
// Zero dependencies. Every change is written straight back to disk, so the server can restart
// without losing anything. Delete data/db.json (or use "Reset data") to start over.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const readSeed = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "seed", name), "utf8"));
// seed/events.json is written by `node import/run.js`: real listings plus when they were imported
function seedEvents() {
  const file = readSeed("events.json");
  return Array.isArray(file) ? { importedAt: "sample", events: file } : file;
}

// Sample friends you can add to a party (not real people), with the taste profile Crew Blend reads.
const FRIENDS = {
  Aiko: { vibes: ["Live music", "Jazz", "Film nights", "Records & vinyl"], origin: "union", budget: 20 },
  Priya: { vibes: ["Climbing", "Run & ride", "Art & making"], origin: "kipling", budget: 40 },
  Sam: { vibes: ["Comedy", "Games & social", "Climbing"], origin: "finch", budget: 10 },
  Leila: { vibes: ["Zines & print", "Art & making", "Writing & poetry"], origin: "union", budget: 20 },
  Zoe: { vibes: ["Dance", "Indie gigs", "Live music"], origin: "kennedy", budget: 20 },
  Ben: { vibes: ["Outdoors", "Photography", "Run & ride"], origin: "finch", budget: 0 },
};

function seed() {
  const { importedAt, events } = seedEvents();
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    eventsImportedAt: importedAt,
    users: {}, // attendees, keyed by id
    hosts: {}, // host accounts, keyed by id
    parties: {}, // one party per attendee for now
    events, // real imported listings plus anything hosts publish
    requests: readSeed("requests.json"), // Quest Requests
    hostMessages: [], // announcements and live updates
    eventChat: {}, // eventId -> attendee group chat
    checkins: {}, // eventId -> names checked in at the door
    logs: {
      searches: [], // every Discover search, with interests nothing matched (Demand Signals)
      going: [], // "Accept quest" taps: intent, not attendance
      attended: [], // "Did you go?" answers and ratings: what the north star counts
      feedback: [], // "Not for me" taps
    },
  };
}

let data = null;

function load() {
  try {
    data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    data = seed();
    save();
    return data;
  }
  // A fresh import replaces the listings but keeps accounts, logs, requests and host-published quests
  const fresh = seedEvents();
  if (data.eventsImportedAt !== fresh.importedAt) {
    data.events = [...fresh.events, ...data.events.filter((e) => e.publishedBy)];
    data.eventsImportedAt = fresh.importedAt;
    save();
  }
  return data;
}

function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, DB_PATH); // atomic, so a crash never leaves half a file
}

function reset() {
  data = seed();
  save();
  return data;
}

module.exports = {
  get data() {
    return data || load();
  },
  save,
  reset,
  FRIENDS,
};
