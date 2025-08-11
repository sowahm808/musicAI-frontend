// Simple AnalysisEvent broadcaster for dev
// Emits a I-vi-IV-V loop at the given tempo/key

const WebSocket = require('ws');
const PORT = process.env.PORT || 7071;
const wss = new WebSocket.Server({ port: PORT });

const PROG = ['C', 'Am', 'F', 'G'];
const TEMPO = 92; // BPM
const KEY = 'C';
const BEATS_PER_BAR = 4;
const MS_PER_BEAT = 60000 / TEMPO;
const MS_PER_BAR = MS_PER_BEAT * BEATS_PER_BAR;

function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}

wss.on('connection', (ws) => {
  send(ws, { type: 'hello', msg: 'mock-ws ready' });

  let idx = 0;
  const interval = setInterval(() => {
    // Tick once per bar
    const chord = PROG[idx % PROG.length];
    const payload = {
      type: 'analysis.event',
      key: KEY,
      tempo: TEMPO,
      chord,
      bar: idx + 1,
      conf: 0.9
    };
    send(ws, payload);
    idx++;
  }, MS_PER_BAR);

  ws.on('close', () => clearInterval(interval));
});

console.log(`Mock WS server listening ws://localhost:${PORT}`);
