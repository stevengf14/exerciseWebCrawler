'use strict'

// Cargar archivo de propiedades
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./config/application.properties');

// Cargar ficheros ruta
var news_routes = require(properties.get('route_news_routes'));

// Ejecutar express (http)
var express = require('express');
var app = express();

// Prefijo a rutas / Cargar rutas
app.use('/api', news_routes);

// Exportar módulo
module.exports = app; 