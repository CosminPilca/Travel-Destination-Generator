// Global variables
let map;
let currentMarker;
let selectedContinent = 'all';
let allCountries = [];

// DOM elements
const loadingOverlay = document.getElementById('loadingOverlay');
const generateBtn = document.getElementById('generateBtn');
const countrySection = document.getElementById('countrySection');
const countryInfo = document.getElementById('countryInfo');
const particlesContainer = document.getElementById('particles');
const continentBtns = document.querySelectorAll('.continent-btn');

// Initialize particles
function createParticles() {
  const particleCount = window.innerWidth < 768 ? 25 : 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 25 + 's';
    particle.style.animationDuration = Math.random() * 10 + 20 + 's';
    particlesContainer.appendChild(particle);
  }
}

// Fixed map initialization - using only reliable sources
function initMap() {
  try {
    map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      attributionControl: true
    });

    // Use ONLY OpenStreetMap - most reliable
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Force map size immediately
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

  } catch (error) {
    console.error('Map initialization failed:', error);
    // Hide map container if it fails
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.style.display = 'none';
    }
  }
}

// Continent filter handlers
continentBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    continentBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedContinent = btn.dataset.continent;
    console.log('Selected continent:', selectedContinent); // Debug log
  });
});

// Generate button handler
generateBtn.addEventListener('click', async () => {
  countrySection.classList.remove('show');
  generateBtn.classList.add('loading');
  loadingOverlay.classList.add('show');
  
  await generateCountry();
});

// Fixed fetch with proper error handling
async function fetchCountries() {
  try {
    if (allCountries.length === 0) {
      console.log('Fetching countries data...');
      
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,region,subregion,area,currencies,languages,latlng,flags', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      allCountries = await response.json();
      console.log('Fetched countries:', allCountries.length);
    }

    // Fixed continent filtering
    let filteredCountries = allCountries;
    
    if (selectedContinent !== 'all') {
      console.log('Filtering by continent:', selectedContinent);
      
      filteredCountries = allCountries.filter(country => {
        const region = country.region;
        const subregion = country.subregion;
        
        switch(selectedContinent) {
          case 'Africa':
            return region === 'Africa';
          case 'Asia':
            return region === 'Asia';
          case 'Europe':
            return region === 'Europe';
          case 'North America':
            // Fixed North America filtering
            return region === 'Americas' && (
              subregion === 'Northern America' || 
              subregion === 'Central America' || 
              subregion === 'Caribbean'
            );
          case 'South America':
            return region === 'Americas' && subregion === 'South America';
          case 'Oceania':
            return region === 'Oceania';
          default:
            return true;
        }
      });
      
      console.log('Filtered countries count:', filteredCountries.length);
    }

    return filteredCountries;
    
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

// Generate random country
async function generateCountry() {
  try {
    const countries = await fetchCountries();
    
    if (countries.length === 0) {
      throw new Error('No countries found for selected continent');
    }

    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    console.log('Selected country:', randomCountry.name.common);
    await displayCountry(randomCountry);
    
  } catch (error) {
    console.error('Error:', error);
    showError();
  } finally {
    loadingOverlay.classList.remove('show');
    generateBtn.classList.remove('loading');
  }
}

// Fixed display function with proper flag sizing
async function displayCountry(country) {
  const name = country.name.common;
  const capital = country.capital ? country.capital[0] : 'N/A';
  const population = country.population ? country.population.toLocaleString() : 'N/A';
  const region = country.region || 'N/A';
  const subregion = country.subregion || 'N/A';
  const area = country.area ? country.area.toLocaleString() + ' km²' : 'N/A';
  const currency = country.currencies ? Object.values(country.currencies)[0].name : 'N/A';
  const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
  const coordinates = country.latlng || [0, 0];

  // Get flag URL with fallback
  const flagUrl = country.flags?.svg || country.flags?.png || '';

  // FIXED: Consistent flag sizing across all devices
  countryInfo.innerHTML = `
    <h2 id="countryName" class="pulse">${name}</h2>
    <div class="flag-container" style="text-align: center; margin: 1rem 0; height: 90px; display: flex; align-items: center; justify-content: center;">
      <img id="flag" 
           src="${flagUrl}" 
           alt="${name} Flag" 
           style="max-width: 120px; max-height: 80px; width: auto; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);" 
           onerror="this.style.display='none';" />
    </div>
    <div class="details-grid">
      <div class="detail-item">
        <div class="detail-label"><i class="fas fa-city"></i> Capital</div>
        <div class="detail-value">${capital}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label"><i class="fas fa-users"></i> Population</div>
        <div class="detail-value">${population}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label"><i class="fas fa-globe-americas"></i> Region</div>
        <div class="detail-value">${region}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label"><i class="fas fa-map-marker-alt"></i> Subregion</div>
        <div class="detail-value">${subregion}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label"><i class="fas fa-expand-arrows-alt"></i> Area</div>
        <div class="detail-value">${area}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label"><i class="fas fa-coins"></i> Currency</div>
        <div class="detail-value">${currency}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label"><i class="fas fa-language"></i> Languages</div>
        <div class="detail-value">${languages}</div>
      </div>
    </div>
  `;

  updateMap(coordinates, name, capital);
  updateBackground(name);

  // Show country section
  setTimeout(() => {
    countrySection.classList.add('show');
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
      const countryNameEl = document.getElementById('countryName');
      if (countryNameEl) {
        countryNameEl.classList.remove('pulse');
      }
    }, 600);
  }, 200);
}

// Fixed map update function
function updateMap(coordinates, countryName, capital) {
  if (!map) {
    console.log('Map not available');
    return;
  }

  try {
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }

    const [lat, lng] = coordinates;
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.log('Invalid coordinates:', coordinates);
      return;
    }

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #667eea; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    currentMarker = L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 5px;">
          <h3 style="margin: 0 0 5px 0; color: #333; font-size: 14px;">${countryName}</h3>
          <p style="margin: 0; color: #666; font-size: 12px;">Capital: ${capital}</p>
        </div>
      `)
      .openPopup();

    map.setView([lat, lng], 5);
    
  } catch (error) {
    console.error('Map update error:', error);
  }
}

// Simplified background update
function updateBackground(countryName) {
  try {
    const bg = document.getElementById('bgImage');
    if (bg) {
      const gradient = 'linear-gradient(-45deg, #1e3c72, #2a5298, #667eea, #764ba2)';
      bg.style.background = gradient;
      bg.style.backgroundSize = '400% 400%';
    }
  } catch (error) {
    console.warn('Background update error:', error);
  }
}

// Show error message
function showError() {
  countryInfo.innerHTML = `
    <div style="background: rgba(220, 38, 127, 0.1); border: 1px solid rgba(220, 38, 127, 0.3); border-radius: 12px; padding: 2rem; text-align: center;">
      <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: rgba(220, 38, 127, 0.8); margin-bottom: 1rem;"></i>
      <p style="margin: 0; color: #fff;">Something went wrong. Please check your internet connection and try again.</p>
    </div>
  `;
  countrySection.classList.add('show');
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing app...');
  
  createParticles();
  
  // Add CSS fixes immediately
  const style = document.createElement('style');
  style.textContent = `
    /* FIXED FLAG SIZING */
    .flag-container {
      height: 90px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 1rem 0 !important;
    }
    
    .flag-container img {
      max-width: 120px !important;
      max-height: 80px !important;
      width: auto !important;
      height: auto !important;
      object-fit: contain !important;
    }
    
     FIXED MAP SIZING */
    #map {
      height: 400px !important;
      width: 100% !important;
      border-radius: 12px !important;
    }
    
    @media (max-width: 768px) {
      #map {
        height: 300px !important;
      }
      
      .flag-container {
        height: 70px !important;
      }
      
      .flag-container img {
        max-width: 100px !important;
        max-height: 60px !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Initialize map after DOM is ready
  setTimeout(() => {
    initMap();
  }, 500);
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 250);
});


