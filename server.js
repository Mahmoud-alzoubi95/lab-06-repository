"use strict";

require("dotenv").config();

const express = require("express");
const superagent = require("superagent");
const cors = require("cors");
const { response } = require("express");
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const app = express();
app.use(cors());

app.get("/location", handleLocationrequest);
app.get("/weather", handleWeatherrequest);
app.get("/parks", handleParkrequest);

function handleLocationrequest(req, res) {
  const city = req.query.city;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
  if (!city) {
    res.status(500).send("sorry, some thing went wrong");
  }
  // console.log(city);
  // const locationsRawData = require('./data/location.json');

  superagent.get(url).then((resData) => {
      const location = new Location(city, resData.body[0]);
      res.send(location);
    }).catch(() => {
      response.status(404).send("your search not found");
    });
}

// const  WeatherData = [];

function handleWeatherrequest(req, res) {

  const lat = req.query.latitude;
  const lon = req.query.longitude;
// const newurl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`;
  // const WeatherRawData = require('./data/weather.json');

  superagent.get(url).then(resweath => {
    let currentWeather = [];
    // console.log(res.body.data);
    resweath.body.data.map((element) => {
      currentWeather.push(new WeatherProp(element));
      return currentWeather;
    });
    res.send(currentWeather);
  }).catch(() => {
    res.status(404).send("your search not found");
  });
}

function handleParkrequest(req, res) {

  const parkUrl=`https://developer.nps.gov/api/v1/parks?city=${req.query.search_query}&api_key=${PARKS_API_KEY}&limit=10`;

  superagent.get(parkUrl).then(reqData => {

      const parkData = reqData.body.data.map(park => {
        return new NewPark(park);
      });
      res.send(parkData);
    }).catch(() => {
    //   console.log("ERROR", error); 
      res.status(500).send("there is no data about your request");
    });
}

function NewPark(data) {
  this.name = data.name;
  this.address = `${data.addresses[0].line1} ${data.addresses[0].city} ${data.addresses[0].stateCode} ${data.addresses[0].postalCode}`;
  this.fee ="0.00";
  this.park_url = data.url;
}

  
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

function WeatherProp(element) {

  this.description = element.weather.description;
  this.date = element.valid_date;
}

app.use("*", (req, res) => {
  res.send("some thing went wrong");
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
