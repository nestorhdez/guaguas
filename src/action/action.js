'use strict';
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const serverless = require('serverless-http');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.post('/', (request, response) => {
  response.json({res: 'Post received'});
});

exports.handler = serverless(app);
