const apiEndpoint = 'https://api.weatherapi.com/v1/';
const apiKey = '7f73379c835f4f34a31212956251708';

const locationInput = document.getElementById('location');
const searchBtn = document.getElementById('search-btn');
const weatherDataDiv = document.getElementById('weather-data');
const forecastDataDiv = document.getElementById('forecast-data');
const errorLog = document.getElementById('error-log');

searchBtn.addEventListener('click', fetchWeatherData);

// Try to load weather for current GPS location on startup
window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
      },
      err => {
        showError("Location access denied. Please search manually.");
      }
    );
  } else {
    showError("Geolocation not supported on this device.");
  }
});

function fetchWeatherData() {
  const location = locationInput.value.trim();
  if (!location) {
    showError('Please enter a location');
    return;
  }

  const currentWeatherUrl = `${apiEndpoint}current.json?key=${apiKey}&q=${location}`;
  const forecastUrl = `${apiEndpoint}forecast.json?key=${apiKey}&q=${location}&days=7`;

  fetchAndDisplay(currentWeatherUrl, forecastUrl);
}

function fetchWeatherByCoords(lat, lon) {
  const currentWeatherUrl = `${apiEndpoint}current.json?key=${apiKey}&q=${lat},${lon}`;
  const forecastUrl = `${apiEndpoint}forecast.json?key=${apiKey}&q=${lat},${lon}&days=7`;

  fetchAndDisplay(currentWeatherUrl, forecastUrl);
}

function fetchAndDisplay(currentUrl, forecastUrl) {
  Promise.all([
    fetch(currentUrl).then(res => res.json()),
    fetch(forecastUrl).then(res => res.json())
  ])
    .then(([current, forecast]) => {
      if (current.error) {
        showError(current.error.message);
        return;
      }
      displayWeatherData(current);
      displayForecastData(forecast);
    })
    .catch(err => showError('Error fetching data: ' + err));
}

function displayWeatherData(data) {
  weatherDataDiv.innerHTML = `
    <h2>Current Weather in ${data.location.name}</h2>
    <p>Temperature: ${data.current.temp_f}°F</p>
    <p>Condition: ${data.current.condition.text}</p>
    <p>Wind: ${data.current.wind_mph} mph</p>
  `;
}

function displayForecastData(data) {
  let html = '<h2>7-Day Forecast</h2>';
  data.forecast.forecastday.forEach(day => {
    html += `
      <p>
        <strong>${day.date}:</strong> 
        ${day.day.condition.text}, 
        High: ${day.day.maxtemp_f}°F, 
        Low: ${day.day.mintemp_f}°F
      </p>
    `;
  });
  forecastDataDiv.innerHTML = html;
}

function showError(msg) {
  errorLog.style.color = 'red';
  errorLog.innerText = msg;
}
