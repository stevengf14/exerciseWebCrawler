// Cargar archivo de propiedades
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./config/application.properties');
const newsRoute = String(properties.get('route_news'));
const puppeteer = require('puppeteer');


var controller = {
    getNews: (req, res) => {
        console.log("ruta: " + properties.get('route_news'));
        var news = Promise.resolve(getAllNews());
        news.then((value) => {
            if (value) {
                return res.status(200).send({
                    status: 'success',
                    news: value
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'Ha ocurrido un error, intente más tarde'
                })
            }
        });
    },

    getNewsLongTitle: (req, res) => {
        console.log("ruta: " + properties.get('route_news'));
        var news = Promise.resolve(getAllNews());
        var newsSorted = [];
        news.then((value) => {
            if (value) {

                // Filtrado de elementos con menor o igual n palabras
                for (let element of value) {
                    if (element.title.split(" ").length > properties.get('number_filter_words')) {
                        newsSorted.push(element);
                    }
                }

                // Burbuja para ordenar elementos
                for (var i = 1; i < newsSorted.length; i++) {
                    for (var j = 0; j < newsSorted.length - i; j++) {
                        var aux = {}
                        // Split por c --> ej: 155 comments = 155
                        // Se asigna 0 a los elementos null para enviarlos al final
                        var commentSplit1 = newsSorted[j].comments != null ? newsSorted[j].comments.split(properties.get('variable_split_comment')) : null;
                        var number1 = newsSorted[j].comments != null ? parseInt(commentSplit1[0]) : 0;
                        var commentSplit2 = newsSorted[j + 1].comments != null ? newsSorted[j + 1].comments.split(properties.get('variable_split_comment')) : null;
                        var number2 = newsSorted[j + 1].comments != null ? parseInt(commentSplit2[0]) : 0;
                        if (number1 < number2) {
                            aux = newsSorted[j];
                            newsSorted[j] = newsSorted[j + 1];
                            newsSorted[j+1]=aux;
                        }
                    }
                }
                return res.status(200).send({
                    status: 'success',
                    news: newsSorted
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'Ha ocurrido un error, intente más tarde'
                })
            }
        });
    },

    getNewsShortTitle: (req, res) => {
        console.log("ruta: " + properties.get('route_news'));
        var news = Promise.resolve(getAllNews());
        var newsSorted = [];
        news.then((value) => {
            if (value) {

                // Filtrado de elementos con menor o igual n palabras
                for (let element of value) {
                    if (element.title.split(" ").length <= properties.get('number_filter_words')) {
                        newsSorted.push(element);
                    }
                }

                // Burbuja para ordenar elementos
                for (var i = 1; i < newsSorted.length; i++) {
                    for (var j = 0; j < newsSorted.length - i; j++) {
                        var aux = {}
                        // Split por c --> ej: 155 points = 155 
                        // Se asigna 0 a los elementos null para enviarlos al final
                        var pointSplit1 = newsSorted[j].points != null ? newsSorted[j].points.split(properties.get('variable_split_point')) : null;
                        var number1 = newsSorted[j].points != null ? parseInt(pointSplit1[0]) : 0;
                        var pointSplit2 = newsSorted[j + 1].points != null ? newsSorted[j + 1].points.split(properties.get('variable_split_point')) : null;
                        var number2 = newsSorted[j + 1].points != null ? parseInt(pointSplit2[0]) : 0;
                        if (number1 < number2) {
                            aux = newsSorted[j];
                            newsSorted[j] = newsSorted[j + 1];
                            newsSorted[j+1]=aux;
                        }
                    }
                }
                return res.status(200).send({
                    status: 'success',
                    news: newsSorted
                });
            }
            else {
                return res.status(404).send({
                    status: 'error',
                    message: 'Ha ocurrido un error, intente más tarde'
                })
            }
        });

    }
}

async function getAllNews() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var news = [];
    await page.goto(newsRoute);

    // Imagen de la página
    await page.screenshot({ path: 'capturePage.jpg' });

    // Obetención de Auxiliar Comments y Points
    const retAux = await page.evaluate(() => {
        const elements = document.querySelectorAll('.subtext');
        const tmp = [];
        for (let element of elements) {
            tmp.push(element.innerText);
        }
        return tmp
    });
    const aux = [];

    var j = 0;
    for (let error of retAux) {
        const auxError = {};
        auxError.iterator = j;
        if (!error.includes('comment')) {
            auxError.comments = j;
        }
        else {
            auxError.comments = -1;
        }
        if (!error.includes('points')) {
            auxError.points = j;
        } else {
            auxError.points = -1;
        }
        aux.push(auxError);
        j++;
    }

    // Obetención de Títulos 
    const titles = await page.evaluate(() => {
        const elements = document.querySelectorAll('td.title a.storylink');
        const tmp = [];
        for (let element of elements) {
            tmp.push(element.innerText);
        }
        return tmp;
    });

    // Obetención de Número de Ordenes
    const orders = await page.evaluate(() => {
        const elements = document.querySelectorAll('td.title span.rank');
        const tmp = [];
        for (let element of elements) {
            tmp.push(element.innerText);
        }
        return tmp;
    });

    // Obetención de Points
    const points = await page.evaluate(() => {
        const elements = document.querySelectorAll('td.subtext span.score');
        const tmp = [];
        for (let element of elements) {
            tmp.push(element.innerText);
        }
        return tmp;
    });

    // Obtención de Comments
    const comments = await page.evaluate(() => {
        const elements = document.querySelectorAll('td.subtext a');
        const tmp = [];
        var i = 0;
        for (let element of elements) {
            if (element.innerText.includes('comment')) {
                tmp.push(element.innerText);
            }
        }
        return tmp;
    });

    // Variables para el control de existencia de comentarios y points
    var iComments = 0;
    var iPoints = 0;

    // Asignación y contrucción del objeto News 
    for (var i = 0; i < comments.length || i < 30; i++) {
        var tmp = {};
        tmp.title = titles[i];
        tmp.order = orders[i].replace('.','');

        // Validación si el elemento contiene points
        if (parseInt(aux[i].points) == -1) {
            tmp.points = points[iPoints];
            iPoints++;
        } else {
            tmp.points = null;
        }

        // Validación si el elemento contiene comments
        if (parseInt(aux[i].comments) == -1) {
            tmp.comments = comments[iComments];
            iComments++;
        } else {
            tmp.comments = null;
        }
        news.push(tmp);
    }
    await browser.close();
    return news;
}

module.exports = controller;