# Sprinkler Plan

Plan your sprinkler system with confidence.

Upload a photo of your yard, place your sprinkler heads, and visualize exactly what each head covers. Set a weekly watering goal and fine-tune head positions until every inch of lawn gets what it needs.

**[sprinklerplan.com](https://sprinklerplan.com)** — no account needed, runs entirely in your browser.

---

## Features

- **Visual layout** — place heads directly on your yard photo and see coverage arcs drawn to scale in real time
- **True-to-scale** — calibrate using any two points with a known distance; every measurement reflects your actual yard
- **Goal-based planning** — set a weekly watering target (like 1 inch/week), then adjust head placement and zone run times until every zone hits it

## How it works

1. **Upload a yard photo** — any aerial or top-down photo works; a Google Maps screenshot is perfect
2. **Set the scale** — click two points on the image and enter the real-world distance between them
3. **Place sprinkler heads** — add heads, assign zones, and adjust radius and arc angle to match your hardware
4. **Dial in your coverage** — set a weekly watering goal, then tune zone run times and head positions until the coverage map shows every area is hitting its target

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

The output goes to `dist/` and can be served as a static site. Deployed on Cloudflare Pages.

## Tech

React + Vite, plain JavaScript. All data stored locally in the browser (localStorage / IndexedDB) — nothing is sent to a server.
