const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('dfsdfsdfResale server is running');
  });
app.get('/test', (req, res) => {
    res.send('dfsdfsdfResale server is running');
  });


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });