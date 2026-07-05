import axios from 'axios';

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'admin@dlvsaas.com',
      password: 'SuperAdmin@123'
    });
    const token = loginRes.data.data.accessToken;

    const patchRes = await axios.patch('http://localhost:4000/api/v1/admin/businesses/cmr3ayb7u0018wvah1n75rttj/loyalty-settings', {
      pointsPerRupee: 0.15
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('PATCH Response:', JSON.stringify(patchRes.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();
