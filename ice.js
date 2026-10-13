/* Super BomberBoyz – ICE-servere (STUN/TURN) for PeerJS.
   Henter TURN-pålogginger fra Metered (gratis prøveplan, 500 MB/mnd, uten kort) ved oppstart.
   apiKey i turnUrl er Metereds offentlige frontend-nøkkel (gjelder kun én TURN-credential).
   Feiler hentingen (eller turnUrl er tom), brukes PeerJS-standard + Google STUN. */
'use strict';
window.BBICE = (() => {
  const STUN = { urls: 'stun:stun.l.google.com:19302' };
  const cfg = (window.BBX_CONFIG && window.BBX_CONFIG.turnUrl) || '';
  const KEY = 'bbx-ice-v1';
  const S = { done: !cfg, ice: null };
  try { const c = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (c && c.exp > Date.now()) { S.ice = c.ice; S.done = true; } } catch (e) { }
  const ready = S.done ? Promise.resolve() : Promise.race([
    fetch(cfg, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(d => {
      let list = Array.isArray(d) ? d : d && d.iceServers; if (!list || !list.length) throw new Error('no iceServers');
      if (!Array.isArray(list)) list = [list];
      S.ice = [STUN, ...list];
      try { sessionStorage.setItem(KEY, JSON.stringify({ ice: S.ice, exp: Date.now() + 6 * 3600e3 })); } catch (e) { }
    }),
    new Promise(r => setTimeout(r, 3000)),
  ]).catch(e => console.warn('[ice] TURN fetch failed, using defaults', e)).then(() => { S.done = true; });
  // PeerJS: config ERSTATTER standarden, så legg bare på config når vi faktisk har TURN.
  function opts(o) { return S.ice ? { ...o, config: { iceServers: S.ice, sdpSemantics: 'unified-plan' } } : o; }
  return { ready, opts, get done() { return S.done; }, get hasTurn() { return !!S.ice; } };
})();
