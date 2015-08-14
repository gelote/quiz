// Basado en la solución de Miguel Ángel Santamaría y Francisco Fornell
var models = require('../models/models.js');
var Sequelize = require('sequelize');

var estadisticas = {
    preguntas: 0,
    comentarios: 0,
    media_comentarios: 0,
    preguntas_con_comentarios: 0,
    preguntas_sin_comentarios: 0,
    comentarios_publicados: 0
};

// Redondeo para mejorar el formato de la media
function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

exports.getData = function (req, res, next) {
    //Ejecuta las consultas asíncronamente en paralelo y continúa cuando han acabado.
    Sequelize.Promise.all([
        models.Quiz.count(),
        models.Comment.count(),
        models.Comment.countCommentedQuizes(),
        models.Comment.countPublished(),

    ]).then(function (values) {

        estadisticas.preguntas = values[0];
        estadisticas.comentarios = values[1];
        estadisticas.media_comentarios = (values[0] === 0) ? 0 : roundToTwo(values[1] / values[0]);
        estadisticas.preguntas_con_comentarios = values[2];
        estadisticas.preguntas_sin_comentarios = values[0] - values[2];
        estadisticas.comentarios_publicados = values[3];

    }).catch(function (err) {
        next(err);
    }).finally(function () {
        next();
    });
};

// GET /statistics
exports.show = function (req, res) {
    res.render('statistics/show', {
        data: estadisticas,
        errors: []
    });
};