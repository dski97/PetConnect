const axios = require('axios');
const qs = require('querystring');

const CLIENT_ID = process.env.PETFINDER_API_KEY;
const CLIENT_SECRET = process.env.PETFINDER_SECRET;

function getAccessToken() {
  const data = qs.stringify({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  return axios.post('https://api.petfinder.com/v2/oauth2/token', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  .then(response => response.data.access_token)
  .catch(error => {
    console.error('Error obtaining access token:', error);
  });
}

function getOrganizations(accessToken, state = 'CT', page = 1, limit = 100) {
  return axios.get(`https://api.petfinder.com/v2/organizations?state=${state}&page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Error fetching organizations:', error);
  });
}

function getAnimalsByOrganization(accessToken, organizationId, page = 1, limit = 100) {
  return axios.get(`https://api.petfinder.com/v2/animals?organization=${organizationId}&page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Error fetching animals:', error);
  });
}

module.exports = { getAccessToken, getOrganizations, getAnimalsByOrganization };