/*
 * Author: Pierre-Étienne Petit
 * Date: September 19, 2023
 * Version: 1.0
 * License: GNU GPLV3
 *
 * Description:
 * This file contains an Express.js web application that interacts with the OpenWeatherMap API.
 * It allows users to search for weather information by city name and displays both current weather
 * and a 5-day weather forecast. The application uses EJS for templating and Axios for making API requests.
 *
 * API endpoints and keys:
 * - API_GEOLOCATOR_URL: URL for geolocation API to find cities by name.
 * - API_WEATHER_URL: URL for current weather API.
 * - API_FORECAST_URL: URL for 5-day weather forecast API.
 * - API_KEY: Your API key for OpenWeatherMap.
 *
 * Routes:
 * - "/" (GET): Renders the main index page with a search form.
 * - "/" (POST): Handles city search requests and displays search results.
 * - "/weather" (POST): Displays weather and forecast information for a chosen city.
 *
 */

import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { API_KEY } from "./config.mjs"; // file containing API key

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const API_GEOLOCATOR_URL = "https://api.openweathermap.org/geo/1.0/direct?q=";
const API_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?";
const API_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?";

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/", async (req, res) => {
  const name = req.body.city;
  try {
    const cityResults = await axios.get(
      `${API_GEOLOCATOR_URL}${name}&limit=5&appid=${API_KEY}`
    );
    res.render("index.ejs", { cityResults: cityResults.data });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

app.post("/weather", async (req, res) => {
  const chosenCityValue = req.body.chosenCity;
  const [lat, lon] = chosenCityValue.split(", ");

  try {
    const [chosenCityWeather, chosenCityForecast] = await Promise.all([
      axios.get(
        `${API_WEATHER_URL}lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric`
      ),
      axios.get(
        `${API_FORECAST_URL}lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric`
      ),
    ]);

    // Display weather and forecast data on the weather page.
    res.render("weather.ejs", {
      weatherData: chosenCityWeather.data,
      forecastData: chosenCityForecast.data,
    });
  } catch (error) {
    // Handle errors and display an error message.
    res.render("weather.ejs", { errorMessage: error.message });
    console.error(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/*
// Use this function to test the forecast API
function displayForecast(data) {
  for (const entry of data.list) {
    const time = entry.dt_txt; // Date and time of the forecast
    const temperature = entry.main.temp; // Temperature in this forecast entry
    const weatherDescription = entry.weather[0].description; // Weather description
    const icon = entry.weather[0].icon; // Weather icon code
    // Extract other relevant data as needed...

    // You can use this data to display or process the weather forecast.
    console.log(`Timestamp: ${time}`);
    console.log(`Temperature: ${temperature}°C`);
    console.log(`Weather Description: ${weatherDescription}`);
    console.log(`Weather Icon: ${icon}`);
  }
}
*/
