'use strict'

// Cargar archivo de propiedades
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./config/application.properties');

var express = require('express');
var newsController = require(properties.get('route_news_controllers'));

var router = express.Router();

// Rutas Servicios

// Todos los News
router.get('/get', newsController.getNews);
// News Filtrado por > 5 palabras en el título, ordenado por comentarios
router.get('/getNewsLongTitle', newsController.getNewsLongTitle);

// News Filtrado por <= 5 palabras en el título, ordenado por comentarios
router.get('/getNewsShortTitle', newsController.getNewsShortTitle);

module.exports = router;