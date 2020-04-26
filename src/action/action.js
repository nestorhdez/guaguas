exports.handler = async (event, context) => {
  
  if(event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      body: 'http method should be "post"'
    } 
  }

  return {
    status: 200,
    body: JSON.stringify(event.body)
  }
}
