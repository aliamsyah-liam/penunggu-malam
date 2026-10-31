// Server mabar Penunggu Malam — WebSocket relay sederhana (room berbasis kode)
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const MAX_PLAYERS = 4;
const MAPS = ['hospital', 'graveyard', 'school'];
const rooms = new Map();
let nextId = 1;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Penunggu Malam server OK\nRoom aktif: ' + rooms.size + '\n');
});
const wss = new WebSocketServer({ server });

function newCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    let s = '';
    for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
    if (!rooms.has(s)) return s;
  }
}
function send(ws, o) {
  if (ws.readyState === 1) ws.send(JSON.stringify(o));
}
function bcast(room, from, o) {
  const data = JSON.stringify(o);
  for (const c of room.clients) if (c !== from && c.readyState === 1) c.send(data);
}
function leave(ws) {
  const r = ws.room;
  if (!r) return;
  r.clients.delete(ws);
  ws.room = null;
  bcast(r, ws, { t: 'peer_leave', id: ws.id });
  if (r.clients.size === 0) rooms.delete(r.code);
}

wss.on('connection', (ws) => {
  ws.id = nextId++;
  ws.room = null;
  ws.name = 'Pemain';
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    if (raw.length > 2000) return;
    let m;
    try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;

    if (m.t === 'join') {
      leave(ws);
      let r = null;
      if (m.room) {
        r = rooms.get(String(m.room).toUpperCase());
        if (!r) return send(ws, { t: 'error', msg: 'Room tidak ditemukan.' });
      } else {
        const code = newCode();
        r = {
          code,
          map: MAPS.includes(m.map) ? m.map : 'hospital',
          seed: (Math.random() * 2147483647) | 0,
          clients: new Set(),
        };
        rooms.set(code, r);
      }
      if (r.clients.size >= MAX_PLAYERS) return send(ws, { t: 'error', msg: 'Room penuh (maks ' + MAX_PLAYERS + ').' });
      ws.name = String(m.name || 'Pemain').slice(0, 12);
      ws.room = r;
      const others = [...r.clients].map((c) => ({ id: c.id, name: c.name }));
      r.clients.add(ws);
      send(ws, { t: 'joined', id: ws.id, room: r.code, map: r.map, seed: r.seed, peers: others });
      bcast(r, ws, { t: 'peer_join', id: ws.id, name: ws.name });
      return;
    }

    const r = ws.room;
    if (!r) return;
    if (m.t === 's') {
      if (![m.x, m.y, m.z, m.yaw].every(Number.isFinite)) return;
      bcast(r, ws, { t: 's', id: ws.id, x: m.x, y: m.y, z: m.z, yaw: m.yaw });
    } else if (m.t === 'item') {
      if (!Number.isInteger(m.i)) return;
      bcast(r, ws, { t: 'item', id: ws.id, i: m.i });
    } else if (m.t === 'dead' || m.t === 'win') {
      bcast(r, ws, { t: m.t, id: ws.id });
    }
  });

  ws.on('close', () => leave(ws));
  ws.on('error', () => {});
});

// buang koneksi mati tiap 30 detik
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

server.listen(PORT, () => console.log('Server mabar jalan di port ' + PORT));
