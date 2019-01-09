require('dotenv').config();
require('fs').writeFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const express = require('express');
const app = express();
var db = require("./models");
var PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Init app
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars");

// Public Folder
app.use(express.static('./public'));

require('./routes/readings-api-routes.js')(app);

db.sequelize.sync({ force: true }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});