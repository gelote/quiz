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
      res.render('quizes/index.ejs', { quizes: quizes, search: null, errors: [] });
    });
  } else {
    models.Quiz.findAll({
      where: ["pregunta like ?", ('%' + req.query.search + '%').replace(/ /g,"%")], order:'pregunta ASC'
    }).then(function(quizes){
      res.render('quizes/index.ejs', { quizes: quizes, search: req.query.search, errors: [] });
    });
  }
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: [] } );
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (unificar(req.query.respuesta) === unificar(req.quiz.respuesta)) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] }); // req.quiz: instancia de quiz cargada con autoload
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(     // crea objeto quiz
    { pregunta: 'Pregunta', respuesta: 'Respuesta', tema: 'otro', nuevo: 1 }
  );
  res.render('quizes/new', { quiz: quiz, errors: [] } );
};

// GET /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz.validate().then(
    function(err){
      if(err){
        res.render('quizes.new', { quiz: quiz, errors: err.errors });
      } else {
        //Guarda en BD los campos pregunta y respuesta de quiz
        quiz.save({fields: ['pregunta', 'respuesta', 'tema']}).then(
          function(){ res.redirect('/quizes');
        })  //Redirección HTTP (URL relativa) a lista de preguntas
      }
    }
  );
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ['pregunta', 'respuesta', 'tema']})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};
