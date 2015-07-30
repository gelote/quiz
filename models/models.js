var path = require('path');

//Cargar modelo ORM
var Sequelize = require("sequelize");


//Postgres DATABASE_URL = postgres://user:passwd@host:port/database
//SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user = (url[2]||null);
var pwd = (url[3]||null);
var protocol = (url[1]||null);
var dialect = (url[1]||null);
var port = (url[5]||null);
var host = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

var sequelize = new Sequelize(DB_name, user, pwd,
                              { dialect:  dialect,
                                protocol: protocol,
                                port:     port,
                                host:     host,
                                storage:  storage,  //solo SQLite (.env)
                                omitNull: true      //solo Postgres
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
