//Definición del modelo de Quiz

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Quiz',
              { pregunta:  {
                  type: DataTypes.STRING,
                  validate: { notEmpty: {msg: "-> Falta Pregunta"}}
                },
                respuesta: {
                  type: DataTypes.STRING,
                  validate: { notEmpty: {msg: "-> Falta Respuesta"}}
                },
                tema: {
                  type: DataTypes.STRING,
                  validate: { notEmpty: {msg: "-> Falta Tema"}}
                }
              }, {

                  classMethods: {

                      filterQuizes: function (userId, search) {
                          var options = {};
                          var campoLike;
                          
                          if (search) {
                              campoLike = ('%' + search.toLowerCase() + '%').replace(/ /g, "%");

                              options = {
                                  where: ["lower(pregunta) like ?", campoLike],
                                  order: 'pregunta ASC'
                              };
                          }

                          if (userId) {
                              if (search) {          
                                  options.where = ["lower(pregunta) like ? AND UserId = ?", campoLike, userId];
                              } else {
                                  options.where = { UserId: userId };
                              }
                          }

                          return this.findAll(options).then('success', function (quizes) {
                              return quizes;
                          })
                      }
                  }
              });
}
