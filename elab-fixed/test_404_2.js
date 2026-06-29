const axios = require('axios');
const urls = [
  'https://elab.runasp.net/api/patient/Branchs/GetAll',
  'https://elab.runasp.net/api/Patient/Branchs/GetAll',
  'https://elab.runasp.net/api/patient/Branchs/GetAll/',
  'https://elab.runasp.net/api/Patient/Branchs/GetAll/'
];

async function test() {
  for (const url of urls) {
    try {
      const res = await axios.get(url);
      console.log(`SUCCESS [${url}]: ${res.status}`);
    } catch (err) {
      console.log(`FAILED [${url}]: ${err.response?.status || err.message}`);
    }
  }
}
test();