import https from 'https';

const apiKey = 'cal_live_e17cc48d9dd1068857af7b67f396b787';

const options = {
  hostname: 'api.cal.com',
  port: 443,
  path: `/v1/availability?apiKey=${apiKey}&eventTypeId=123`, // Testing with fake ID
  method: 'GET'
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', d => { data += d; });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
