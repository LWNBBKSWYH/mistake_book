// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8989;


const usersRouter = require('./routers/users');
const mistake_setRouter = require('./routers/mistake_set');

app.use(cors());
app.use(express.json());
// 打印收到的信息
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

app.use('/api/users', usersRouter);
app.use('/api/mistake_set', mistake_setRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
