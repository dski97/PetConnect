require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const petconnect = require('./petconnect');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});

let accessToken;

// Authenticate the Petfinder API
petconnect.getAccessToken().then(token => {
  // Store the access token for subsequent requests
  accessToken = token;

  // Add a new endpoint to fetch organizations
  app.get('/organizations', (req, res) => {
    petconnect.getOrganizations(accessToken)
      .then(organizations => {
        res.json(organizations.organizations); // Send organizations to the client
      })
      .catch(error => {
        console.error('Error fetching organizations:', error);
        res.status(500).send('Error fetching organizations');
      });
  });
});

app.get('/animals', (req, res) => {
  const organizationId = req.query.organization;
  petconnect.getAnimalsByOrganization(accessToken, organizationId)
    .then(animals => {
      res.json(animals.animals); // Send animals to the client
    })
    .catch(error => {
      console.error('Error fetching animals:', error);
      res.status(500).send('Error fetching animals');
    });
});