// Define the basemaps
const OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
const Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}');
const Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png');
const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

// Create the map and set the view to Connecticut
const map = L.map('map', {
  center: [41.6032, -72.7],
  zoom: 9,
  layers: [OpenStreetMap_Mapnik] // Set the default basemap
});

// Define the basemaps as an object
const baseMaps = {
  "OpenStreetMap Mapnik": OpenStreetMap_Mapnik,
  "Esri WorldStreetMap": Esri_WorldStreetMap,
  "Stamen Toner": Stamen_Toner,
  "Esri WorldImagery": Esri_WorldImagery
};

// Add the layer control to the map
L.control.layers(baseMaps).addTo(map);

// Add the popup to the map
window.addEventListener('load', function() {
  document.getElementById('welcome-popup').style.display = 'block';
});

// Close the popup when the close button is clicked
document.getElementById('close-welcome-popup').addEventListener('click', function() {
  document.getElementById('welcome-popup').style.display = 'none';
});

//Add icon to the map
var pawIcon = L.divIcon({
  className: 'leaflet-paw-icon',
  html: '<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 512 512"><style>svg{fill:#005eff}</style><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z"/></svg>',
  iconSize: [55, 55] // You can set the size here
});

// Create a legend control
const legend = L.control({ position: 'bottomleft' });

// When the control is added to the map
legend.onAdd = function (map) {
  // Create a div element for the legend
  const div = L.DomUtil.create('div', 'leaflet-legend');
  
  // Add content to the legend (using the Font Awesome icon)
  div.innerHTML += '<strong>Layers:</strong><br>';
  div.innerHTML += '<i class="fa-solid fa-paw fa-lg" style="color: #005eff;"></i> Shelters<br>';

  return div;
};

// Add the legend to the map
legend.addTo(map);

// Function to geocode an address and return the coordinates
function geocodeAddress(address, callback) {
  const fullAddress = `${address.address1}, ${address.city}, ${address.state}, ${address.postcode}, ${address.country}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=AIzaSyBOdFHC_Nuxzaf6fvgVO3ehHSZAPOJr3js`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results[0]) {
        const coordinates = data.results[0].geometry.location;
        callback([coordinates.lat, coordinates.lng]);
      }
    })
    .catch(error => console.error('Error geocoding address:', error));
}

// Fetch the organizations from the new endpoint
fetch('https://3.219.202.200:3000/organizations')
  .then(response => response.json())
  .then(organizations => {
    // Iterate through the organizations and add a marker for each one
    organizations.forEach(organization => {
      // Check if the address information is available
      if (organization.address && organization.address.city && organization.address.state) {
        // Geocode the address 
        geocodeAddress(organization.address, coordinates => {
          // Add a marker to the map at the coordinates
          const marker = L.marker(coordinates, { icon: pawIcon }).addTo(map);
          //Create a unique id for pets button
          const viewPetsButtonId = `view-pets-button-${organization.id}`;
          // Create a popup with the organization's information
          const popupContent = `
          <div class="organization-popup">
            <h3>${organization.name || 'N/A'}</h3>
            <img src="${organization.photos && organization.photos[0] ? organization.photos[0].medium : 'https://dski97.github.io/PetConnect/public/placeholder-image.svg'}" alt="${organization.name || 'N/A'}">
            <button id="${viewPetsButtonId}" data-organization-id="${organization.id}" class="view-pets-popup-button">View Pets</button>
            <p><strong>Phone:</strong> ${organization.phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${organization.email || 'N/A'}</p>
            <p><strong>Petfinder Page:</strong> <a href="${organization.url || '#'}" target="_blank">View on Petfinder</a></p>
            <p><strong>Website:</strong> <a href="${organization.website || '#'}" target="_blank">${organization.website || 'N/A'}</a></p>
            <p><strong>Adoption Policy:</strong> <a href="${organization.adoption && organization.adoption.url ? organization.adoption.url : '#'}" target="_blank">View Policy</a></p>
            <p><strong>Social Media:</strong> ${organization.social_media ? Object.entries(organization.social_media).map(([key, value]) => value ? `<a href="${value}" target="_blank">${key}</a>` : '').join(' | ') : 'N/A'}</p>
            <p><strong>Hours:</strong> ${organization.hours ? Object.entries(organization.hours).map(([key, value]) => `<br>${key}: ${value || 'Closed'}`).join('') : 'N/A'}</p>
          </div>
        `;
        
          // Bind the popup to the marker
          marker.bindPopup(popupContent);

          marker.on('popupopen', function() {
            const viewPetsButton = document.getElementById(viewPetsButtonId);
            viewPetsButton.addEventListener('click', function() {
              const organizationId = this.getAttribute('data-organization-id');
              fetchPetsAtShelter(organizationId);
            });
          });
        });
      }
    });
  })
  .catch(error => console.error('Error fetching organizations:', error));

  //fetch pets at shelter
  function fetchPetsAtShelter(organizationId) {
    fetch(`https://3.219.202.200:3000/animals?organization=${organizationId}`)
      .then(response => response.json())
      .then(pets => {
        createPetWindow(pets);
      })
      .catch(error => console.error('Error fetching pets:', error));
  }
  
  //create pet window to display pets
  function createPetWindow(pets) {
    // Remove any existing pet window
    const existingPetWindow = document.getElementById('pet-window');
    if (existingPetWindow) existingPetWindow.remove();
    
    // Create a div element for the window
    const petWindow = document.createElement('div');
    petWindow.id = 'pet-window';
    petWindow.className = 'pet-window';
  
    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.id = 'pet-window-close-button';
    closeButton.className = 'pet-window-close-button';
    closeButton.innerHTML = 'Close';
    closeButton.addEventListener('click', function() {
      petWindow.remove();
    });
  
    // Add the close button to the window
    petWindow.appendChild(closeButton);
  
    // Add the pet information to the window
    pets.forEach(pet => {
      const petDiv = document.createElement('div');
      petDiv.className = 'pet-info';
  
      // Add pet details (e.g., name, image, etc.)
      petDiv.innerHTML = `
      <h4><a href="${pet.url}" target="_blank">${pet.name}</a></h4>
      <img src="${pet.photos && pet.photos[0] ? pet.photos[0].medium : 'https://dski97.github.io/PetConnect/public/placeholder-image.svg'}" alt="${pet.name}">
      <p><strong>Type:</strong> ${pet.type}</p>
      <p><strong>Species:</strong> ${pet.species}</p>
      <p><strong>Breeds:</strong> ${pet.breeds.primary}</p>
      <p><strong>Colors:</strong> ${pet.colors.primary}</p>
      <p><strong>Age:</strong> ${pet.age}</p>
      <p><strong>Gender:</strong> ${pet.gender}</p>
      <p><strong>Size:</strong> ${pet.size}</p>
      <p><strong>Coat:</strong> ${pet.coat}</p>
      <p><strong>Description:</strong> ${pet.description || 'No description available.'}</p>
      <p><strong>URL:</strong> <a href="${pet.url}" target="_blank">View on Petfinder</a></p>
    `;
  
      // Add the pet div to the window
      petWindow.appendChild(petDiv);
    });
  
    // Append the window to the body of the page
    document.body.appendChild(petWindow);
  }

// Hide the title when a popup is opened
map.on('popupopen', function() {
  document.getElementById('map-title').style.display = 'none';
});

// Show the title when a popup is closed
map.on('popupclose', function() {
  document.getElementById('map-title').style.display = 'block';
});


