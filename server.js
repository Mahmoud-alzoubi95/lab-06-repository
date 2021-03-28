'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;


const app = express();
app.use(cors()); //what the functionallity of "use"??

app.get('/package-lock',handleLocationrequest)
app.get('/data/weather',handleWeatherrequest)

function handleLocationrequest(req, res) {

    const searchQuery = req.query.city;
    // console.log(searchQuery);

    const locationsRawData = require('./data/location.json');
    const location = new Location(locationsRawData[0]);
    res.send(location);

}

function handleWeatherrequest(req, res) {
    const WeatherRawData = require('./data/weather.json');
    const  WeatherData = [];

    WeatherRawData.nearby_restaurants.forEach(restaurant => {
        WeatherData.push(new Restaurant(restaurant));
    });

    res.send(WeatherData);

}

function Location(data) {
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}


function Restaurant(data) {
    this.restaurant = data.restaurant.name;
    this.cuisines = data.restaurant.cuisines;
    this.locality = data.restaurant.location.locality;
}

app.use('*', (req, res) => {
    res.send('some thing went wrong');
});

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });