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
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY =process.env.YELP_API_KEY;

const app = express();
app.use(cors());

app.get("/location", handleLocationrequest);
app.get("/weather", handleWeatherrequest);
app.get("/parks", handleParkrequest);
app.get('/movies',handlemovies);
app.get('/yelp',handleYelp);

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


function handlemovies(req,res){
  let arrayOFMovies=[];
  // const url=`https://api.themoviedb.org/3/movie/550?api_key=da735d1206c20c177c63a737bdb7678e`;
  // const url =`https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&query=${request.query.city}`;
  const url =`https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${req.query.search_query}`;
  superagent.get(url).then(data=> {
    let movies=data.body.results;
    movies.forEach(element=>{
      arrayOFMovies.push(new Movies(element));
    });
    res.send(arrayOFMovies);
    console.log(arrayOFMovies)
  }).catch((err)=> {
    console.log('ERROR IN movies API');
    console.log(err);
  });
}


function handleYelp(req,res){
 
  let arrYelps=[];
  let resArray='';
  let lat = req.query.latitude;
  let lon = req.query.longitude;
const url =`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}`
superagent.get(url).set(`Authorization`,`Bearer${YELP_API_KEY}`).then(data=>{
  let yelpsData=data.body.businesses;
  yelpsData.forEach(element=>{
    arrYelps.push(new Yelps(element))
    resArray=arrYelps.slice((page-1)*5,page*5);
  })
  res.send(resArray);
}).catch((err)=> {
  console.log('ERROR IN movies API');
  console.log(err);
});
}

function Yelps(data){
  this.name=data.name;
  this.url=data.url;
  this.price=data.price;
  this.rating=data.rating;
  this.image_url=data.image_url;
}

function Movies(data){
  this.title=data.title;
  this.overview=data.overview;
  this.average_votes=data.vote_average;
  this.total_votes=data.vote_count;
  this.image_url=`https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity=data.popularity;
  this.released_on=data.release_date;
}


function NewPark(data) {
  this.name = data.name;
  this.address = `${data.addresses[0].line1} ${data.addresses[0].city} ${data.addresses[0].stateCode} ${data.addresses[0].postalCode}`;
  this.fees ="0.00";
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
