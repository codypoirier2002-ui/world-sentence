# World from a Sentence

Type one line, like *a swamp ruled by frogs* or *a mall at the bottom of the ocean*, and walk around the small low-poly 3D world it makes, right in the browser. Phone first.

Every world gets a name, an intro card, 3–5 points of interest with deadpan signs, and 3–5 locals who wander about and say something when you tap them. Worlds you make are kept in a gallery in your browser, and you can share any world as a link.

## Controls

| | Phone | Desktop |
|---|---|---|
| Walk | left thumb (floating joystick) | WASD or arrow keys, Shift to run, Space to hop |
| Look | drag with your right thumb | click to capture the mouse (Esc releases), or drag |
| Talk / read | tap a local, sign or landmark | click it, or press E for whatever is under the dot |

The ◐ button changes the time of day, ♪ toggles sound, Share copies a link to the world.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # generator, sanitizer and server tests
```

Without an API key everything works: worlds come from the built-in keyword generator, and the title screen says *offline worlds*.

## Turn on AI worlds (your Claude API key)

The key lives only on the small server in `server/`. The browser never sees it, and the server never prints or logs it.

1. Copy `server/env.example` to **`server/.env`** (that file is git-ignored).
2. Put your key right after `ANTHROPIC_API_KEY=` (no quotes, no spaces). Nothing else is needed.
3. In a second terminal run `npm run server`. It should say `API key found (not shown)`.
4. Reload http://localhost:5173. The title screen now says *AI worlds on*.

Vite forwards `/api` to the server on port 8787. If the server is down, busy, over its daily cap, or the model declines a sentence, the world is built offline instead and the intro card says why.

## Publish on GitHub Pages

1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Merge to `main` (or run the *Deploy to GitHub Pages* workflow by hand). The site appears at `https://codypoirier2002-ui.github.io/world-sentence/`.

## AI on the live site

GitHub Pages only serves static files, so the AI server has to run somewhere else. The repo is set up for a free Cloudflare Worker:

1. `npx wrangler login`
2. `npx wrangler secret put ANTHROPIC_API_KEY -c server/wrangler.toml` and paste the key when it asks. Cloudflare stores it encrypted; it never goes in the repo.
3. `npx wrangler deploy -c server/wrangler.toml`. It prints a URL like `https://world-sentence-api.<your-account>.workers.dev`.
4. In GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**, name `WORLD_API_URL`, value that URL.
5. Re-run the Pages workflow.

`server/wrangler.toml` already allows requests from your Pages site. For an exact daily cap across Cloudflare's instances, create a KV namespace as described in that file. Any Node host works too: run `node server/node.js` with `ANTHROPIC_API_KEY` set, and `TRUST_PROXY=1` behind a reverse proxy.

## Cost and limits

- Model: `claude-haiku-5-5` at low effort, chosen for speed and price. One call per world with a structured-output schema, plus a small call when a local runs out of lines.
- Caps (set in `server/.env` or `wrangler.toml`): `DAILY_CALL_CAP` (300 calls per UTC day overall) and `PER_IP_DAILY_CAP` (40 per visitor). Past either, worlds build offline until tomorrow.
- At current Haiku 5.5 prices a world costs a fraction of a cent, so even a fully used default cap stays well under a dollar a day.

## How it works

A sentence becomes a **recipe**: one JSON object with a palette, terrain, sky, weather, ambience, props picked from a built-in kit, landmarks with signs, and locals with lines. Every recipe (from the AI, the keyword generator, a saved world or a share link) passes through `sanitizeRecipe()` before it is built, and the same recipe always builds the same world.

```
src/gen/       generate.js (keyword generator), themes.js, lexicon.js, text.js,
               recipe.js (sanitizer), ai.js (talks to the server)
src/kit/       catalog.js (the kit as data, shared with the server), props.js,
               landmarks.js, creatures.js, builder.js (low-poly geometry)
src/engine/    terrain, sky, weather, audio (all procedural), locals, signs,
               controls, world (recipe -> scene), engine (render loop)
src/ui/        building sequence, HUD, gallery
server/        core.js (Web-standard handler), node.js, worker.js, schema.js, prompt.js
```

Performance: everything is flat-shaded vertex colour, props are instanced, landmarks are merged into one mesh, weather runs on the GPU, and resolution adapts to keep the frame rate up on older phones and integrated graphics.

Privacy: the gallery is stored only in your browser. A share link contains the whole world, so anyone with the link sees it. The server keeps nothing but daily counters keyed by a hashed IP.

Everything in a world is invented: the prompt tells the model to make original stand-ins for any real people, brands, games or characters.
