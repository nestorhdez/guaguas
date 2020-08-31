const webpush = require('web-push');
const getBus = require('../action/getData');

exports.handler = async (event, context) => {
  if(event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      body: 'HTTP method must be POST'
    }
  }

  // Get pushSubscription object
  const { body: subscription } = event;
  const { busStop, line } = event.queryStringParameters;

  console.log(`Request received: Bus stop: ${busStop}, line: ${line}`);

  const baseUrl = new URL(process.env["BUS_URL"] || '');

  if(!baseUrl) {
    return {
      statusCode: 404,
      body: 'Bus URL not found'
    }
  }

  busStop && baseUrl.searchParams.set('busStop', busStop);
  line && baseUrl.searchParams.set('line', line);
  const url = baseUrl.toString();

  const publicVapidKey = process.env["PUBLIC_VAPID_KEY"] || '';
  const privateVapidKey = process.env["PRIVATE_VAPID_KEY"] || '';

  try {
    webpush.setVapidDetails(
      `mailto:${process.env["PUSH_EMAIL"] || ''}`,
      publicVapidKey,
      privateVapidKey
    );

    const response = {
      title: 'Parada de guaguas',
      body: 'No hay información de la parada. Inténtelo más tarde.'
    }
  
    const { result, error } = await getBus(url);

    if(error) throw new Error(error);

    if(result && result.length) {
      response.body = result.map(
        ( {line, time} ) => `Guagua ${line}, ${time} minutos`
      ).join('. ');
    }

    const payload = JSON.stringify(response);

    // Pass object into sendNotification
    webpush
      .sendNotification(subscription, payload)
      .catch(e => { throw new Error(e) });
  
    console.log("Notification pushed! 🚀");

  }catch(error) {
    console.error({ error });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error
      })
    }
  }

  // Send 201 - resource created
  return {
    statusCode: 201,
    body: JSON.stringify({})
  }

}
