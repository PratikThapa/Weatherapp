const apiKey = '2e7ebc5858c53784c672c08c03744a03';
const loading = $('#loading');
const weatherData = $('#weatherData');
const forecast = $('#forecast');
const cityInput = $('#cityInput');
const savedCities = $('#savedCities');

// Initialize favorite cities from localStorage
let favoriteCitiesList = JSON.parse(localStorage.getItem('favoriteCities')) || [];

// Load settings from localStorage
const loadSettings = () => {
    const bgColor = localStorage.getItem('--bg-color') || '#037c6e';
    const textColor = localStorage.getItem('--text-color') || '#000000';
    const fontSize = localStorage.getItem('--font-size') || '16px';
    const fontFamily = localStorage.getItem('--font-family') || 'Arial';

    $('#bgColor').val(bgColor);
    $('#textColor').val(textColor);
    $('#fontSize').val(parseInt(fontSize));
    $('#fontStyle').val(fontFamily);

    applySettings(bgColor, textColor, fontSize, fontFamily);
};

const applySettings = (bgColor, textColor, fontSize, fontFamily) => {
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--font-size', fontSize);
    document.documentElement.style.setProperty('--font-family', fontFamily);
    
    $('body').css({
        backgroundColor: bgColor,
        color: textColor,
        fontSize: fontSize,
        fontFamily: fontFamily,
    });
};

$(document).ready(function () {
    updateFavoriteCities();
    loadSettings(); // Load settings on page load
});

// Event listener for the search button
$('#searchBtn').click(function () {
    const city = cityInput.val().trim();
    if (!/^[a-zA-Z\s]+$/.test(city)) {
        showErrorDialog('Please enter a valid city name.');
        return;
    }
    fetchWeatherData(city);
});

// Fetch weather data
function fetchWeatherData(city) {
    loading.show();
    weatherData.hide();
    forecast.hide();
    $('#searchBtn').prop('disabled', true);
    
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
        method: 'GET',
        success: function (data) {
            displayWeather(data);
            fetchForecast(city);
        },
        error: function (jqXHR) {
            if (jqXHR.status === 404) {
                showErrorDialog('City not found. Please try again.');
            } else {
                showErrorDialog('An error occurred: ' + jqXHR.statusText);
            }
        },
        complete: function () {
            loading.hide();
            $('#searchBtn').prop('disabled', false);
        }
    });
}

// Display weather data
function displayWeather(data) {
    const { name, main, weather } = data;
    weatherData.empty(); // Clear previous data

    const weatherCards = `
        <div class="weather-card card">
            <h2>${name}</h2>
            <p>Temperature: ${main.temp}°C</p>
            <p>Condition: ${weather[0].description}</p>
            <p>Humidity: ${main.humidity}%</p>
            <img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" alt="Weather icon">
            <button class="addFavorite" data-city="${name}">Add to Favorite Cities</button>
        </div>
    `;

    weatherData.html(weatherCards).fadeIn();
}

// Fetch forecast data
function fetchForecast(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
        method: 'GET',
        success: function (data) {
            displayForecast(data);
        },
        error: function () {
            showErrorDialog('An error occurred while fetching the forecast.');
        }
    });
}

// Display forecast data
function displayForecast(data) {
    forecast.empty();
    const uniqueDates = new Set(); 
    const forecastData = data.list.filter((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!uniqueDates.has(date)) {
            uniqueDates.add(date);
            return true;
        }
        return false;
    }).slice(0, 5); // Limit to 5 days

    forecastData.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const { main, weather } = item;
        const forecastCard = `
            <div class="forecast-card card">
                <h3>${date}</h3>
                <p>Temp: ${main.temp}°C</p>
                <p>Condition: ${weather[0].description}</p>
                <img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" alt="Weather icon">
            </div>
        `;
        forecast.append(forecastCard);
    });

    forecast.show();
    $('#forecastTitle').show(); // Show forecast title
}

// Update favorite cities display
function updateFavoriteCities() {
    savedCities.empty();
    if (favoriteCitiesList.length === 0) {
        savedCities.hide(); // Hide if no favorite cities
        $('#favoriteCitiesTitle').hide(); // Hide title
        return;
    }
    
    savedCities.show(); // Show if there are favorite cities
    $('#favoriteCitiesTitle').show(); // Show title
    favoriteCitiesList.forEach(city => {
        savedCities.append(`
            <div class="favorite-item card">
                <p>${city} ⭐</p>
                <button class="removeFavorite" data-city="${city}">Remove</button>
            </div>
        `);
    });
}

// Show error dialog
function showErrorDialog(message) {
    $('#citySearchErrorMessage').text(message);
    $('#citySearchErrorDialog').show();
}

// Show city already added dialog
function showCityAlreadyAddedDialog() {
    $('#cityAlreadyAddedDialog').show();
}

// Show added to favorites dialog
function showAddedToFavoritesDialog() {
    $('#cityAddedDialog').show();
}

// Show removed from favorites dialog
function showRemovedFromFavoritesDialog() {
    $('#cityRemovedDialog').show();
}

// Open the settings dialog
$('#styleSettingsIcon').click(function() {
    $('#styleSettingsDialog').show();
});

// Close the dialogs
$(document).on('click', '.close', function() {
    $(this).closest('.dialog-content').hide();
});

// Add to favorite cities
$(document).on('click', '.addFavorite', function () {
    const city = $(this).data('city');
    if (favoriteCitiesList.includes(city)) {
        showCityAlreadyAddedDialog(); // Show already added dialog
    } else {
        favoriteCitiesList.push(city);
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCitiesList));
        updateFavoriteCities();
        showAddedToFavoritesDialog(); // Show success dialog
    }
});

// Remove from favorite cities
$(document).on('click', '.removeFavorite', function () {
    const city = $(this).data('city');
    favoriteCitiesList = favoriteCitiesList.filter(fav => fav !== city);
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCitiesList));
    updateFavoriteCities();
    showRemovedFromFavoritesDialog(); // Show success dialog
});

// Save settings and apply to the app's styles
$('#saveSettings').click(function () {
    const bgColor = $('#bgColor').val();
    const textColor = $('#textColor').val();
    const fontSizeInput = $('#fontSize').val();
    const fontSize = Math.max(12, Math.min(72, fontSizeInput)) + 'px'; 
    const fontFamily = $('#fontStyle').val();
    
    localStorage.setItem('--bg-color', bgColor);
    localStorage.setItem('--text-color', textColor);
    localStorage.setItem('--font-size', fontSize);
    localStorage.setItem('--font-family', fontFamily);
    
    applySettings(bgColor, textColor, fontSize, fontFamily);
    $('#styleSettingsDialog').hide();
});

// Reset to default settings
$('#resetSettings').click(function () {
    const defaultBgColor = '#ffffff'; // Clear white background
    const defaultTextColor = '#000000';
    const defaultFontSize = '16px';
    const defaultFontFamily = 'Arial';

    localStorage.setItem('--bg-color', defaultBgColor);
    localStorage.setItem('--text-color', defaultTextColor);
    localStorage.setItem('--font-size', defaultFontSize);
    localStorage.setItem('--font-family', defaultFontFamily);

    applySettings(defaultBgColor, defaultTextColor, defaultFontSize, defaultFontFamily);

    $('#bgColor').val(defaultBgColor);
    $('#textColor').val(defaultTextColor);
    $('#fontSize').val(parseInt(defaultFontSize));
    $('#fontStyle').val(defaultFontFamily);
});

// Handle city added dialog
$('#okAdded').click(function() {
    $('#cityAddedDialog').hide();
});

// Handle city removed dialog
$('#okRemoved').click(function() {
    $('#cityRemovedDialog').hide();
});

// Handle already added dialog
$('.close').click(function() {
    $('#cityAlreadyAddedDialog').hide();
});

// Handle error dialog to return to search
$('#backToSearch').click(function() {
    $('#citySearchErrorDialog').hide();
});

// Cancel button functionality for style settings
$('#cancelSettings').click(function() {
     $('#styleSettingsDialog').hide();
});