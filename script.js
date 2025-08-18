const apiKey = "156ae177cef40f92941f517eff216625";
let currentLocation = null;
let savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];

const searchInput = document.getElementById("search");
const useLocationBtn = document.getElementById("use-location");
const saveLocationBtn = document.getElementById("save-location");
const savedList = document.getElementById("saved-locations");

const currentWeatherDiv = document.getElementById("current-weather");
const hourlyDiv = document.getElementById("hourly-forecast");
const dailyDiv = document.getElementById("daily-forecast");
const radarFrame = document.getElementById("radar-frame");

// ---------- Load Saved Locations ----------
function renderSavedLocations() {
  savedList.innerHTML = "";
  savedLocations.forEach((loc) => {
    const li = document.createElement("li");
    li.textContent = loc.name;
    li.onclick = () => fetchWeatherByCoords(loc.lat, loc.lon, loc.name);
    savedList.appendChild(li);
  });
}
renderSavedLocations();

// ---------- Get GPS Location ----------
function getGPSLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude, "My Location");
      },
      (err) => {
        alert("Unable to get your location. Please allow GPS or search a city.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// ---------- Fetch Weather ----------
async function fetchWeatherByCoords(lat, lon, name = "") {
  currentLocation = { lat, lon, name };
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=imperial&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API request failed. Check your API key.");
    const data = await res.json();
    renderCurrentWeather(data.current, name);
    renderHourlyForecast(data.hourly);
    renderDailyForecast(data.daily);
    renderRadar(lat, lon);
  } catch (err) {
    alert("Error fetching weather: " + err.message);
  }
}

// ---------- Render Functions ----------
function renderCurrentWeather(curr, name) {
  currentWeatherDiv.innerHTML = `
    <h2>${name}</h2>
    <canvas id="current-icon" width="64" height="64"></canvas>
    <p>Temp: ${curr.temp.toFixed(1)}°F</p>
    <p>Feels Like: ${curr.feels_like.toFixed(1)}°F</p>
    <p>Wind: ${curr.wind_speed} mph</p>
    <p>Precip: ${curr.rain ? (curr.rain["1h"] || 0) + " in" : "0 in"}</p>
  `;
  const skycons = new Skycons({ color: "white" });
  skycons.set("current-icon", mapIcon(curr.weather[0].id));
  skycons.play();
}

function renderHourlyForecast(hourly) {
  hourlyDiv.innerHTML = "<h3>Hourly Forecast</h3><div class='hourly-grid'></div>";
  const container = hourlyDiv.querySelector(".hourly-grid");
  container.style.display = "flex";
  container.style.overflowX = "auto";
  hourly.slice(0, 12).forEach((hr) => {
    const div = document.createElement("div");
    div.style.minWidth = "80px";
    div.style.textAlign = "center";
    div.innerHTML = `
      <canvas id="icon-${hr.dt}" width="32" height="32"></canvas>
      <p>${new Date(hr.dt * 1000).getHours()}:00</p>
      <p>${hr.temp.toFixed(0)}°F</p>
    `;
    container.appendChild(div);
    const skycons = new Skycons({ color: "white" });
    skycons.set(`icon-${hr.dt}`, mapIcon(hr.weather[0].id));
    skycons.play();
  });
}

function renderDailyForecast(daily) {
  dailyDiv.innerHTML = "<h3>7-Day Forecast</h3><div class='daily-grid'></div>";
  const container = dailyDiv.querySelector(".daily-grid");
  container.style.display = "flex";
  container.style.overflowX = "auto";
  daily.slice(0, 7).forEach((day) => {
    const div = document.createElement("div");
    div.style.minWidth = "100px";
    div.style.textAlign = "center";
    div.innerHTML = `
      <canvas id="daily-${day.dt}" width="48" height="48"></canvas>
      <p>${new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</p>
      <p>${day.temp.max.toFixed(0)}° / ${day.temp.min.toFixed(0)}°</p>
      <p>💧${day.rain ? day.rain + " in" : "0 in"}</p>
    `;
    container.appendChild(div);
    const skycons = new Skycons({ color: "white" });
    skycons.set(`daily-${day.dt}`, mapIcon(day.weather[0].id));
    skycons.play();
  });
}

function renderRadar(lat, lon) {
  radarFrame.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=6&level=surface&overlay=radar&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates`;
}

// ---------- Map OpenWeather icons to Skycons ----------
function mapIcon(id) {
  if (id >= 200 && id < 600) return "RAIN";
  if (id >= 600 && id < 700) return "SNOW";
  if (id >= 700 && id < 800) return "FOG";
  if (id === 800) return "CLEAR_DAY";
  if (id > 800) return "PARTLY_CLOUDY_DAY";
  return "CLOUDY";
}

// ---------- Event Listeners ----------
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") fetchCity(searchInput.value);
});

useLocationBtn.addEventListener("click", getGPSLocation);

saveLocationBtn.addEventListener("click", () => {
  if (
    currentLocation &&
    !savedLocations.find(
      (l) => l.lat === currentLocation.lat && l.lon === currentLocation.lon
    )
  ) {
    savedLocations.push(currentLocation);
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    renderSavedLocations();
  }
});

// ---------- Fetch by City Name ----------
async function fetchCity(name) {
  try {
    const geo = `https://api.openweathermap.org/geo/1.0/direct?q=${name}&limit=1&appid=${apiKey}`;
    const res = await fetch(geo);
    if (!res.ok) throw new Error("City lookup failed");
    const data = await res.json();
    if (data.length) {
      fetchWeatherByCoords(data[0].lat, data[0].lon, data[0].name);
    } else {
      alert("City not found");
    }
  } catch (err) {
    alert("Error fetching city: " + err.message);
  }
}

// ---------- Start ----------
getGPSLocation();
