'use strict';
const bodyParser = require('body-parser');
const cors = require('cors');
const { WebhookClient } = require('dialogflow-fulfillment');
const express = require('express');
const serverless = require('serverless-http');
const helmet = require('helmet');

const getBus = require('./getData');

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

function welcome(agent) {
  agent.add(`¿Qué parada quieres consultar?`);
}

function fallback(agent) {
  agent.add(`Lo siento. No te he entendido`);
}

async function busStop(agent) {
  const { parada, linea } = agent.parameters;
  
  const baseUrl = new URL(process.env["BUS_URL"]);
  parada && baseUrl.searchParams.set('busStop', parada);
  linea && baseUrl.searchParams.set('line', linea);
  const url = baseUrl.toString();

  const { result, error } = await getBus(url);

  if(error) {
    agent.add(`Lo siento. Ha ocurrido un error`);
    return;
  }

  const resultText = 
    result.map( ( {line, time} ) => `Guagua ${line}, ${time} minutos` ).join('. ');

  agent.add(resultText);
}

router.post('/', (request, response) => {
  
  try {
    const agent = new WebhookClient({ request, response });

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('parada de guaguas', busStop);
    agent.handleRequest(intentMap);
  }catch(error) {
    return response.status(500).json({error});
  }
});

app.use('/.netlify/functions/action', router);

exports.handler = serverless(app);
