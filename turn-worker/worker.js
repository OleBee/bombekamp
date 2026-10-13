// BomberBoyz TURN-credential Worker.
// GET /  ->  { iceServers: [...] }  (kortlevde Cloudflare Realtime TURN-pålogginger)
// Secrets: TURN_KEY_ID, TURN_KEY_API_TOKEN.  Var: ALLOWED_ORIGINS (kommaseparert), TTL (sekunder).
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const ok = !origin || allowed.includes(origin);
    const cors = { 'Access-Control-Allow-Origin': ok && origin ? origin : allowed[0] || '*', 'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Cache-Control': 'no-store' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!ok) return new Response('forbidden', { status: 403, headers: cors });
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl: Number(env.TTL || 43200) }),
    });
    if (!r.ok) return new Response(JSON.stringify({ error: 'turn api ' + r.status }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    const d = await r.json();
    // Drop port 53-URLer (blokkeres ofte av nettlesere/nettverk)
    const list = (Array.isArray(d.iceServers) ? d.iceServers : [d.iceServers]).map(s => ({
      ...s, urls: [].concat(s.urls).filter(u => !/:53(\?|$)/.test(u)) }));
    return new Response(JSON.stringify({ iceServers: list }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
