const apiEndpoint = 'https://api.weatherapi.com/v1/';
const apiKey = '7f73379c835f4f34a31212956251708';

const locationInput = document.getElementById('location');
const searchBtn = document.getElementById('search-btn');
const weatherDataDiv = document.getElementById('weather-data');
const forecastDataDiv = document.getElementById('forecast-data');

searchBtn.addEventListener('click', fetchWeatherData);

function fetchWeatherData() {
    const location = locationInput.value.trim();
    if (location) {
        const currentWeatherUrl = `${apiEndpoint}current.json?key=${apiKey}&q=${location}`;
        const forecastUrl = `${apiEndpoint}forecast.json?key=${apiKey}&q=${location}&days=7`;

        Promise.all([
            fetch(currentWeatherUrl).then(response => response.json()),
            fetch(forecastUrl).then(response => response.json())
        ])
        .then(([currentWeatherData, forecastData]) => {
            displayWeatherData(currentWeatherData);
            displayForecastData(forecastData);
        })
        .catch(error => console.error('Error:', error));
    }
}

function displayWeatherData(data) {
    const weatherData = `
        <h2>Current Weather in ${data.location.name}</h2>
        <p>Temperature: ${data.current.temp_f}°F</p>
        <p>Condition: ${data.current.condition.text}</p>
        <p>Wind: ${data.current.wind_mph} mph</p>
    `;
    weatherDataDiv.innerHTML = weatherData;
}

function displayForecastData(data) {
    let forecastHtml = '<h2>7-Day Forecast</h2>';
    data.forecast.forecastday.forEach(day => {
        forecastHtml += `
            <p>${day.date}: ${day.day.condition.text}, High: ${day.day.maxtemp_f}°F, Low: ${day.day.mintemp_f}°F</p>
        `;
    });
    forecastDataDiv.innerHTML = forecastHtml;
}
