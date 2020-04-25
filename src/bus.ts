import { Context } from "aws-lambda";

exports.handler = async (event: any, context: Context) => {

  const { busStop, line } = event.queryStringParameters;

  if(!busStop) {
    return {
      statusCode: 400,
      body: 'busStop query needed'
    }
  }

  line ? `Line: ${line}` : '';

  return {
    statusCode: 200,
    body: `Bus stop: ${busStop}. ${line}`
  };
};