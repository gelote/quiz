var models = require('../models/models.js');

// Convierte un texto en mayúsculas, sin acentos y sin espacios antes o después
// para hacer las comparaciones más sencillas
function unificar(texto) {
  var acentos = [[/[ÁÀÄÂ]/, /[ÉÈËÊ]/, /[ÍÌÏÎ]/, /[ÓÒÖÔ]/, /[ÚÙÜÛ]/],
                 ['A',      'E',      'I',      'O',      'U']]

  var resultado = texto.trim().toUpperCase();
  for (var i = 0; i < 5; i++) {
    resultado = resultado.replace(acentos[0][i], acentos[1][i]);
  }
  return resultado
}


// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: {
                id: Number(quizId)
            }
        }).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{
        next(new Error('No existe quizId=' + quizId));
      }
    }
  ).catch(function(error){
    next(error)
  });
};

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

// GET /quizes
exports.index = function(req, res) {
  if (isBlank(req.query.search)) {
    models.Quiz.findAll().then(function(quizes){
      res.render('quizes/index.ejs', { quizes: quizes, search: null });
    });
  } else {
    models.Quiz.findAll({
      where: ["pregunta like ?", ('%' + req.query.search + '%').replace(/ /g,"%")]
    }).then(function(quizes){
      res.render('quizes/index.ejs', { quizes: quizes, search: req.query.search });
    });
  }
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz } );
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (unificar(req.query.respuesta) === unificar(req.quiz.respuesta)) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado }); // req.quiz: instancia de quiz cargada con autoload
};
