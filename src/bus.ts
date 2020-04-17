import { Context } from "aws-lambda";
import { Page, Browser } from "puppeteer";
import {
  args,
  defaultViewport,
  executablePath,
  headless,
  puppeteer
} from "chrome-aws-lambda";

type LineData = {line: string, time: string};

exports.handler = async (event: any, context: Context) => {

  const { busStop, line } = event.queryStringParameters;
  
  if(!busStop) {
    return {
      statusCode: 400,
      body: 'busStop query needed'
    }
  }

  let busStopResponse: LineData[];
  
  const browser: Browser = await puppeteer.launch({
    args: args,
    defaultViewport: defaultViewport,
    executablePath: await executablePath,
    headless: headless,
  });

  try {

    const page: Page = await browser.newPage();
    await page.goto('https:///www.guaguas.com/');
    await page.click('#nav-tabs-wrapper > li.tab2 > a');
    await page.type('#laparada_menu', (busStop as string));
    await page.click('#consulta_parada_menu > div > button[type=submit]');
    await page.waitFor('#resp_parada_menu > div > table', {visible: true});

    const rowsSelector = '#resp_parada_menu > div > table > tbody > tr';

    const response = await page.$$eval(rowsSelector, rows =>
      rows.map( ({ children }: Element) => ({
        line: children[0].textContent!,
        time: children[2].textContent!.split(' ')[0]
      }))
    );

    busStopResponse = line
      ? response.filter( ({line: l} ) => l === line)
      : response;

  } catch(error) {
    await browser.close();
    
    return {
      statusCode: 500,
      body: error
    };
  }

  await browser.close();
  
  return {
    statusCode: 200,
    body: busStopResponse
  };
};