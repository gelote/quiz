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

// Usar BBDD SQLite o Postgres
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

// Importar definicion de la tabla Comment
var Comment = sequelize.import(path.join(__dirname, 'comment'));

// Importar definicion de la tabla Comment
var User = sequelize.import(path.join(__dirname, 'user'));

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// Los quizes pertenecen a un usuario registrado
Quiz.belongsTo(User);
User.hasMany(Quiz);

// exportar tablas de Quiz
exports.Quiz = Quiz;
exports.Comment = Comment;
exports.User = User;

//sequelize.sync() crea e inicializa la tabla de preguntas en DB
sequelize.sync().then(function() {
    User.count().then(function (count) {
        if (count === 0) {   // la tabla se inicializa solo si está vacía
            User.bulkCreate(
                [{ username: 'admin', 
                   password: '1234', 
                    isAdmin:  true },
                 { username: 'pepe', 
                   password: '5678' } // por defecto isAdmin es 'false'
                ]
            ).then(function () {
                console.log('Base de datos (tabla user) inicializada');
                Quiz.count().then(function(count) {
                    if (count === 0) {
                        Quiz.create( {
                            pregunta:  'Capital de Italia',
                            respuesta: 'Roma',
                            tema:      'otro', 
                            UserId:    2
                        });
                        Quiz.create( {
                            pregunta:  'Capital de Portugal',
                            respuesta: 'Lisboa',
                            tema:      'otro',
                            UserId:    2
                        })
                        .then(function() {
                            console.log('Base de datos inicializada');
                        });
                    };
                });
            }, function(err) {
                console.log('Error sincronizando Base de datos (3): ' + err);
            });
        }
    }, function (err) {
        console.log('Error sincronizando Base de datos (2): ' + err);
    });
}, function(err) {
    //Si hubo algún problema
    console.log('Error sincronizando Base de datos (1): ' + err);
});