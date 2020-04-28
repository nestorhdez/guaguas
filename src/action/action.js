'use strict';
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

router.post('/', (request, response) => {
  response.json({res: 'Post received'});
});

app.use('/.netlify/functions/action', router);

exports.handler = serverless(app);
