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


// GET /quizes
exports.index = function(req, res) {
  models.Quiz.findAll().then(function(quizes){
    res.render('quizes/index.ejs', { quizes: quizes });
  });
};

// GET /quizes/:id
exports.show = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    res.render('quizes/show', { quiz: quiz } );
  });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    if (unificar(req.query.respuesta) === unificar(quiz.respuesta)) {
      res.render('quizes/answer', { respuesta: 'Correcto' } );
    } else {
      res.render('quizes/answer', { respuesta: 'Incorrecto' } );
    }
  });
};         // req.quiz: instancia de quiz cargada con autoload
