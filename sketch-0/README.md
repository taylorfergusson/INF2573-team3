# Sketch 0: Event Matcher

**One thing it does:** a user gives it a list of interests, and it gives back matching local events, each with a one-line reason.

This is a disposable sketch. Events are 25 made-up Toronto samples in `events.json`, not real listings. Their reviews and attendees are fixed fake data too.

## Run it

Needs [Node.js](https://nodejs.org) 18 or newer. No `npm install` needed.

```
cd sketch-0
node server.js
```

Then open http://localhost:3000.

## Turn on the AI

Without a key, the app falls back to simple keyword matching (not AI) and says so on the page.

To use AI matching:

1. Copy `.env.example` to a new file called `.env` in this folder.
2. Paste your Anthropic API key into it.
3. Restart `node server.js`.

`.env` is listed in `.gitignore`, so your key is never committed. Never put a key anywhere else in the code.

## Files

- `server.js`: serves the page and sends interests plus events to the AI
- `public/index.html`, `public/app.js`: the page (text box, button, results)
- `events.json`: sample event data
- `strategy.md`: the product strategy the AI is steered by (copied from the repo's `CLAUDE.md`; edit freely)

## Known gaps (on purpose, for later weeks)

- Fake event data. Where real data comes from is a Week 5 feasibility question.
- The user can't correct, reject, or refine matches yet. That's a human-control question for Weeks 4 and 8.
- No handling for when the AI picks badly or makes something up. That's for Weeks 6 and 9.
