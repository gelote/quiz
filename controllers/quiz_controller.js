var models = require('../models/models.js');
var Sequelize = require("sequelize");

/* Funciones de ayuda */

// Convierte un texto en mayúsculas, sin acentos y sin espacios antes o después
// para hacer las comparaciones más sencillas
function unificar(texto) {
    var acentos = [[/[ÁÀÄÂ]/, /[ÉÈËÊ]/, /[ÍÌÏÎ]/, /[ÓÒÖÔ]/, /[ÚÙÜÛ]/],
                   ['A', 'E', 'I', 'O', 'U']]

    var resultado = texto.trim().toUpperCase();
    for (var i = 0; i < 5; i++) {
        resultado = resultado.replace(acentos[0][i], acentos[1][i]);
    }
    return resultado
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

/* Fin funciones de ayuda */

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function (req, res, next) {
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload :id
exports.load = function (req, res, next, quizId) {
    models.Quiz.find({
        where: {
            id: Number(quizId)
        },
        include: [{
            model: models.Comment
        }]
    }).then(
      function (quiz) {
          if (quiz) {
              req.quiz = quiz;
              next();
          } else {
              next(new Error('No existe quizId=' + quizId));
          }
      }
    ).catch(function (error) {
        next(error)
    });
};

// GET /quizes
// GET /users/:userId/quizes
exports.index = function (req, res) {
    var search = null;
    var userId = null;
    var url_busqueda = req.path;

    if (!isBlank(req.query.search)) search = req.query.search;
    if (req.user) userId = req.user.id;
        
    models.Quiz.filterQuizes(userId, search).then(
      function (quizes) {
          res.render('quizes/index.ejs', { quizes: quizes, search: search, url_busqueda: url_busqueda, errors: [] });
      });
};

// GET /quizes/:id
exports.show = function (req, res) {
    res.render('quizes/show', { quiz: req.quiz, errors: [] });
};  // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer
exports.answer = function (req, res) {
    var resultado = 'Incorrecto';
    if (unificar(req.query.respuesta) === unificar(req.quiz.respuesta)) {
        resultado = 'Correcto';
    }
    res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] });
};

// GET /quizes/new
exports.new = function (req, res) {
    var quiz = models.Quiz.build(     // crea objeto quiz
      { pregunta: 'Pregunta', respuesta: 'Respuesta', tema: 'otro' }
    );
    res.render('quizes/new', { quiz: quiz, errors: [] });
};

// POST /quizes/create
exports.create = function (req, res) {
    req.body.quiz.UserId = req.session.user.id;
    var quiz = models.Quiz.build(req.body.quiz);

    quiz.validate().then(
      function (err) {
          if (err) {
              res.render('quizes/new', { quiz: quiz, errors: err.errors });
          } else {
              //Guarda en BD los campos pregunta y respuesta de quiz
              quiz.save({ fields: ['pregunta', 'respuesta', 'tema', 'UserId'] }).then(
                function () {
                    res.redirect('/quizes');
                })  //Redirección HTTP (URL relativa) a lista de preguntas
          }
      }
    ).catch(function (error) { next(error) });
};

// GET /quizes/:id/edit
exports.edit = function (req, res) {
    var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

    res.render('quizes/edit', { quiz: quiz, errors: [] });
};

// PUT /quizes/:id
exports.update = function (req, res) {
    req.quiz.pregunta = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.tema = req.body.quiz.tema;

    req.quiz.validate().then(
      function (err) {
          if (err) {
              res.render('quizes/edit', { quiz: req.quiz, errors: err.errors });
          } else {
              req.quiz     // save: guarda campos pregunta y respuesta en DB
              .save({ fields: ['pregunta', 'respuesta', 'tema'] })
              .then(function () { res.redirect('/quizes'); });
          }     // Redirección HTTP a lista de preguntas (URL relativo)
      }
    ).catch(function (error) { next(error) });
};

// DELETE /quizes/:id
exports.destroy = function (req, res) {
    req.quiz.destroy().then(function () {
        res.redirect('/quizes');
    }).catch(function (error) { next(error) });
};
