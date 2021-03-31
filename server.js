"use strict";

require("dotenv").config();

const express = require("express");
const superagent = require("superagent");
const pg = require('pg');
const cors = require("cors");
const { response } = require("express");
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
// const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// const PARKS_API_KEY = process.env.PARKS_API_KEY;
const app = express();
app.use(cors());



app.get("/location", handleLocationrequest);
app.get("/weather", handleWeatherrequest);
app.get("/parks", handleParkrequest);


const client = new pg.Client(process.env.DATABASE_URL);


function handleLocationrequest(req, res) {
  const city = req.query.city;

  let safeValues=`SELECT * FROM locations WHERE search_query=$1`;
  let sqlQuery=[city];

  const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
  if (!city) {
    res.status(500).send("sorry, some thing went wrong");
  }
  // console.log(city);
  // const locationsRawData = require('./data/location.json');

  client.query(sqlQuery,safeValues).then(result=>{
    if (result.rows.length > 0) {
      console.log("this result from data base : ")
      // lat = result.rows.latitude;
      // lon = result.rows.longitude;
      res.send(result.rows[0]);
  }else{

    superagent.get(url).then((resData) => {
      const location = new Location(city, resData.body[0]);
      let SQL=`INSERT INTO locations(search_query, formatted_query, latitude, longitude)VALUES($1,$2,$3,$4)`;
        let Values = [location.search_query, location.formatted_query, location.latitude, location.longitude];
        client.query(SQL, Values).then(result => {
          console.log(result);

        });
      res.send(location);
    }).catch(() => {
      response.status(404).send("your search not found");
    });
  }})
 





 
}

// const  WeatherData = [];

function handleWeatherrequest(req, res) {

  const lat = req.query.latitude;
  const lon = req.query.longitude;

  const url = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}&include=minutely`;
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

  const parkUrl=`https://developer.nps.gov/api/v1/parks?city=${req.query.searchQuery1}&api_key=${PARKS_API_KEY}&limit=10`;

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
  this.fees ="0.00";
  this.park_url = data.url;
}

  
function Location(city, data) {
  this.searchQuery1 = city;
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

client.connect().then(() => {
        app.listen(PORT, () => {
         console.log(`Listining to PORT: ${PORT}`);
        })
    })