const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const { args, defaultViewport, executablePath, headless } = chromium;

exports.handler = async (event, context) => {

  const { busStop, line } = event.queryStringParameters;

  let browser;
  let busStopResponse;

  if(!busStop) {
    return {
      statusCode: 400,
      body: 'busStop query needed'
    }
  }

  console.log(`Getting bus stop: ${busStop}${line ? ` line: ${line}` : '.'}`);

  try {
    browser = await puppeteer.launch({
      args,
      defaultViewport,
      executablePath: await executablePath,
      headless,
    });

    const page = await browser.newPage();
    await page.goto('https:///www.guaguas.com/');
    await page.click('#nav-tabs-wrapper > li.tab2 > a');
    await page.type('#laparada_menu', busStop);
    await page.click('#consulta_parada_menu > div > button[type=submit]');
    await page.waitFor('#resp_parada_menu > div > table', {visible: true});

    const rowsSelector = '#resp_parada_menu > div > table > tbody > tr';
    const time = (min) => min === '>>' ? 0 : min;
    const response = await page.$$eval(rowsSelector, rows =>
      rows.map( ({ children }) => ({
        line: children[0].textContent,
        time: time(children[2].textContent.split(' ')[0])
      }))
    );

    busStopResponse = line
      ? response.filter( ({line: l} ) => l === line)
      : response;
    
    console.log('Success');
    return {
      statusCode: 200,
      body: JSON.stringify({
        result: busStopResponse
      })
    };

  } catch(error) {
    console.log(`Error: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error
      })
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};