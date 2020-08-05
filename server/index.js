import path from 'path';
import fs from 'fs';

import React from 'react';
import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { Client } from 'pg';
import App from '../src/App';

const PORT = process.env.PORT || 5000;
const dbUrl = process.env.YUGABYTE_CLOUD_DATABASE_URL;
const client = new Client(dbUrl);
client.connect()
const app = express();

app.get('/api/users', (req, res) => {
  res.json([]);
});

app.get('/api/tables', (req, resp) => {
  client.query('SELECT * FROM pg_catalog.pg_tables', (err, res) => {
    console.log(err, res);
    const data = res;
    client.end();
    resp.json(data);
  })
})

app.get('/', (req, res) => {
  const app = ReactDOMServer.renderToString(<App />);

  const indexFile = path.resolve('./build/index.html');
  fs.readFile(indexFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err);
      return res.status(500).send('Oops, better luck next time!');
    }

    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
    );
  });
});

app.use(express.static('./build'));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});