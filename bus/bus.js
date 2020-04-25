const axios = require("axios");

exports.handler = async (event, context) => {

  const { todo } = event.queryStringParameters;

  if(!todo) {
    return {
      statusCode: 400,
      body: 'todo query needed'
    }
  }

  const response = await axios.get(`https://jsonplaceholder.typicode.com/todos/${todo}`);

  return {
    statusCode: 200,
    body: JSON.stringify(response.data)
  };
};