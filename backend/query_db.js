import axios from 'axios';

async function run() {
  try {
    // 1. Login as customer
    const loginRes = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'ananya@gmail.com',
      password: 'Customer@123'
    });

    console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));

    const token = loginRes.data.data.accessToken;

    // 2. Call reviews/generate
    const generateRes = await axios.post('http://localhost:4000/api/v1/reviews/generate', {
      businessId: 'seed-business-cafe',
      rating: 5
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Generate Response:', JSON.stringify(generateRes.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();

