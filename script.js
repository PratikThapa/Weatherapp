const apiKey = '2e7ebc5858c53784c672c08c03744a03'; 
const loading = $('#loading');
const weatherData = $('#weatherData');
const forecast = $('#forecast');
const cityInput = $('#cityInput');
const savedCities = $('#savedCities');

// Initialize favorite cities from localStorage
let favoriteCitiesList = JSON.parse(localStorage.getItem('favoriteCities')) || [];

// Event listener for the search button
$('#searchBtn').click(function () {
    const city = cityInput.val().trim();
    if (!/^[a-zA-Z\s]+$/.test(city)) {
        $('#citySearchError').show(); // Show error dialog
        return;
    }
    fetchWeatherData(city);
});

// Fetch weather data
function fetchWeatherData(city) {
    loading.show();
    weatherData.hide();
    forecast.hide();
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
        method: 'GET',
        success: function (data) {
            displayWeather(data);
            fetchForecast(city);
        },
        error: function () {
            $('#citySearchError').show(); // Show error dialog
        },
        complete: function () {
            loading.hide();
        }
    });
}

// Display weather data
function displayWeather(data) {
    const { name, main, weather } = data;
    weatherData.html(`
        <div class="current-weather">
            <h2>${name}</h2>
            <p>Temperature: ${main.temp}°C</p>
            <p>Condition: ${weather[0].description}</p>
            <p>Humidity: ${main.humidity}%</p>
            <img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" alt="Weather icon">
            <button class="addFavorite" data-city="${name}">Add to Favorite Cities</button>
        </div>
    `).fadeIn();
}

// Fetch forecast data
function fetchForecast(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`,
        method: 'GET',
        success: function (data) {
            displayForecast(data);
        },
        error: function () {
            $('#citySearchError').show(); // Show error dialog
        }
    });
}

// Display forecast data
function displayForecast(data) {
    forecast.empty();
    let forecastHTML = '';
    data.list.forEach((item, index) => {
        if (index % 8 === 0) { // Get data for every 8th item (every 3 hours)
            const date = new Date(item.dt * 1000).toLocaleDateString();
            const { main, weather } = item;
            forecastHTML += `
                <div class="forecast-item">
                    <p>${date}</p>
                    <p>Temp: ${main.temp}°C</p>
                    <p>Condition: ${weather[0].description}</p>
                    <img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" alt="Weather icon">
                </div>
            `;
        }
    });
    forecast.html(forecastHTML).fadeIn();
}

// Update favorite cities display
function updateFavoriteCities() {
    savedCities.empty();
    favoriteCitiesList.forEach(city => {
        savedCities.append(`
            <div class="favorite-item">
                <p>${city} ⭐ <button class="removeFavorite" data-city="${city}">Remove</button></p>
            </div>
        `);
    });
}

// Open the settings dialog
$('#styleSettingsIcon').click(function() {
    $('#styleSettingsDialog').show();
});

// Close the dialogs
$(document).on('click', '.close', function() {
    $(this).closest('.dialog-content').parent().hide(); // Hide the parent dialog
});

// Add to favorite cities
$(document).on('click', '.addFavorite', function () {
    const city = $(this).data('city');
    if (!favoriteCitiesList.includes(city)) {
        favoriteCitiesList.push(city);
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCitiesList));
        updateFavoriteCities();
        $('#cityAddedDialog').show(); // Show added dialog
    } else {
        $('#duplicateCityAlert').show(); 
    }
});

// Remove from favorite cities
$(document).on('click', '.removeFavorite', function () {
    const city = $(this).data('city');
    favoriteCitiesList = favoriteCitiesList.filter(fav => fav !== city);
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCitiesList));
    updateFavoriteCities();
    $('#cityRemovedDialog').show(); // Show removed dialog
});

// Load favorite cities on page load
$(document).ready(function () {
    updateFavoriteCities();
});

// Save settings and apply to the app's styles
$('#saveSettings').click(function () {
    const bgColor = $('#bgColor').val();
    const textColor = $('#textColor').val();
    localStorage.setItem('--bg-color', bgColor);
    localStorage.setItem('--text-color', textColor);
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    $('#styleSettingsDialog').hide(); // Hide dialog after saving
});

// Handle duplicate city alert dialog
$('#okDuplicate').click(function() {
    $('#duplicateCityAlert').hide();
});

// Handle city added dialog
$('#okAdded').click(function() {
    $('#cityAddedDialog').hide();
});

// Handle city removed dialog
$('#okRemoved').click(function() {
    $('#cityRemovedDialog').hide();
});

// Handle error dialog to return to search
$('#backToSearch').click(function() {
    $('#citySearchError').hide();
});