// Cloudflare Worker entry point (deploy with: npx wrangler deploy -c server/wrangler.toml).
// Secrets: npx wrangler secret put ANTHROPIC_API_KEY -c server/wrangler.toml
// Optional KV namespace bound as USAGE keeps the daily cap exact across instances.
import { createServer, MemoryStore } from './core.js';

class KVStore {
  constructor(kv) { this.kv = kv; }
  async get(k) { return Number(await this.kv.get(k)) || 0; }
  async incr(k) {
    const v = (await this.get(k)) + 1;
    await this.kv.put(k, String(v), { expirationTtl: 60 * 60 * 48 });
    return v;
  }
}

const memory = new MemoryStore();
let handler = null;

export default {
  async fetch(request, env) {
    if (!handler) handler = createServer({ env, store: env.USAGE ? new KVStore(env.USAGE) : memory, log: (m) => console.log(m) });
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    return handler(request, { ip });
  },
};
