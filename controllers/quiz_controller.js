var models = require('../models/models.js');

// GET /quizes/question
exports.question = function(req, res) {
  models.Quiz.findAll().then(function(quiz) {
    res.render('quizes/question', { pregunta: quiz[0].pregunta } );
  });
};

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

// GET /quizes/answer
exports.answer = function(req, res) {
  models.Quiz.findAll().then(function(quiz) {
    if (unificar(req.query.respuesta) === unificar(quiz[0].respuesta)) {
      res.render('quizes/answer', { respuesta: 'Correcto' } );
    } else {
      res.render('quizes/answer', { respuesta: 'Incorrecto' } );
    }
  });
};
