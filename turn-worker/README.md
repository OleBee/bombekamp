# BomberBoyz TURN-worker (Cloudflare Realtime TURN)

Uten TURN feiler video/data mellom ulike nett (mobil ↔ wifi, strenge NAT). PeerJS sin gratis relé er lagt ned.

1. Cloudflare dashboard → Realtime → TURN Server → Create. Noter **Turn Token ID** og **API Token**.
2. `cd turn-worker && npx wrangler login && npx wrangler deploy`
3. `npx wrangler secret put TURN_KEY_ID` og `npx wrangler secret put TURN_KEY_API_TOKEN`
4. Test: `curl https://bomberboyz-turn.<konto>.workers.dev/` → `{"iceServers":[...]}`
5. Sett `turnUrl` i `bbx-config.js` til Worker-URL-en.

Klienten (`ice.js`) henter ICE-servere ved oppstart (maks 3 s, cache 6 t i sessionStorage)
og legger til `stun:stun.l.google.com:19302`. Feiler hentingen, brukes PeerJS-standarden som før.
Gratis kvote hos Cloudflare: 1000 GB/mnd TURN-trafikk.
