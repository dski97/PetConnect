require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const path = require('path');
const petconnect = require('./petconnect');

// Read the SSL certificate files
const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');

// Require CORS
const cors = require('cors');
// enable CORS
app.use(cors());

// Create credentials object
const credentials = { key: privateKey, cert: certificate };

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the HTTPS server
httpsServer.listen(3000, '0.0.0.0', () => {
  console.log('HTTPS Server running on https://0.0.0.0:3000');
});

let accessToken;

// Authenticate the Petfinder API
petconnect.getAccessToken().then(token => {
  accessToken = token;

  app.get('/organizations', (req, res) => {
    petconnect.getOrganizations(accessToken)
      .then(organizations => {
        res.json(organizations.organizations);
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
      res.json(animals.animals);
    })
    .catch(error => {
      console.error('Error fetching animals:', error);
      res.status(500).send('Error fetching animals');
    });
});
