import https from 'https';

const apiKey = 'cal_live_e17cc48d9dd1068857af7b67f396b787';

const options = {
  hostname: 'api.cal.com',
  port: 443,
  path: `/v2/event-types`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', d => { data += d; });
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
