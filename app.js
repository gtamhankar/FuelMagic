const express = require('express');
const app = express();
const multer = require('multer');
var db = require("./models");
var PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");


app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars");

const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1500000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}



// Init app


var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars");

// Public Folder
app.use(express.static('./public'));


app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } 
    else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        ///put some handlebars here to show successful upload
        res.redirect('/');
      }
    }
  });
});

require('./routes/readings-api-routes.js')(app);




db.sequelize.sync({ force: true }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});