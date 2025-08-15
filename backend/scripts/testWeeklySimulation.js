// testWeeklySimulation.js
const axios = require('axios');

async function testWeeklySimulation(weekNumber = 1) {
  try {
    const response = await axios.post(`http://localhost:4000/league/simulate/week/${weekNumber}`);
    console.log('Simulation response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Simulation error:', error.response.data);
    } else {
      console.error('Request failed:', error.message);
    }
  }
}

const week = process.argv[2] || 1;
testWeeklySimulation(week); 