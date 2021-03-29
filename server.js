'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;


const app = express();
app.use(cors());

app.get('/location',handleLocationrequest)
app.get('/weather',handleWeatherrequest)

function handleLocationrequest(req, res) {
    
    const searchQuery = req.query.city;
    if(!searchQuery){
        res.status(500).send('sorry, some thing went wrong')
    }
    // console.log(searchQuery);
    const locationsRawData = require('./data/location.json');
    const location = new Location(locationsRawData[0]);
    res.send(location);

}

const  WeatherData = [];
function handleWeatherrequest(req, res) {

    const WeatherRawData = require('./data/weather.json');
    
        WeatherRawData.data.forEach(item => {
        let weatheobject = new WeatherProp(item.weather.description , item.valid_date)
        WeatherData.push(weatheobject);
    });

    res.send(WeatherData);
}

function Location(data ,searchQuery) {
    this.searchQuery1 =searchQuery;
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}

function WeatherProp(weatherdescription , valid_date ) {

    this.description = weatherdescription;
    this.date = valid_date;
}

app.use('*', (req, res) => {
    res.send('some thing went wrong');
});

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });