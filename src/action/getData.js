const https = require('https');

module.exports = (url) =>
  new Promise((resolve, reject) =>
    https.get(url, async (resp) => {
      resp.on('data', (chunk) => resolve(JSON.parse(chunk)) );
    }).on("error", (e) => reject(e) )
  );
