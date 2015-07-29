var path = require('path');

//Cargar modelo ORM
var Sequelize = require("sequelize");

//Usar BBDD SQLite
var DB_name = null;
var user = null;
var pwd = null;
//var protocol = null;
var dialect = 'sqlite';
//var port = null;
//var host = null;
var storage = path.join(__dirname, '../quiz.sqlite');
var sequelize = new Sequelize(DB_name, user, pwd,
                              { dialect: dialect,
                                storage: storage
                              });

//Importar la definición de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
exports.Quiz = Quiz; //exportar la definición de tabla Quiz

//sequelize.sync() crea e inicializa la tabla de preguntas en DB
sequelize.sync().then(function() {
  //success(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().then(function(count) {
    if (count === 0) {
        Quiz.create( {
          pregunta: 'Capital de Italia',
          respuesta: 'Roma'
        })
        .then(function() {
          console.log('Base de datos inicializada');
        });
    };
  });
}, function(err) {
  //Si hubo algún problema
  console.log('Error sincronizando Base de datos: ' + err);
});
