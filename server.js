require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'v2.html')));
app.get('/index.html', (req, res) => res.status(403).end());
app.get('/v2', (req, res) => res.redirect('/'));
app.use(express.static(path.join(__dirname), { index: false }));

function sbHeaders() {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
}

app.get('/api/data', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/portal_data?id=eq.main&select=data`, { headers: sbHeaders() });
    const rows = await r.json();
    res.json(rows.length ? rows[0].data : {});
  } catch { res.json({}); }
});

app.post('/api/data', async (req, res) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/portal_data`, {
      method: 'POST',
      headers: { ...sbHeaders(), 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: 'main', data: req.body })
    });
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

app.post('/api/log', async (req, res) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/portal_history`, {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ snapshot: req.body.snapshot || {} })
    });
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

app.get('/api/history', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/portal_history?order=ts.desc&limit=300`, { headers: sbHeaders() });
    const rows = await r.json();
    res.json(rows.map(row => ({ ts: row.ts, snapshot: row.snapshot })));
  } catch { res.json([]); }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
