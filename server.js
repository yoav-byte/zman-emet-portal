const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

app.get('/v2', (req, res) => {
  res.sendFile(path.join(__dirname, 'v2.html'));
});

app.use(express.static(path.join(__dirname)));

let sharedData = {};

app.get('/api/data', (req, res) => {
  res.json(sharedData);
});

app.post('/api/data', (req, res) => {
  sharedData = req.body;
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
