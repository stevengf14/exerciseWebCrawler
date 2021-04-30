'use strict'

var app = require('./app');
var port = 3901;

// Inicio del servidor
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:'+port+'/');
});
