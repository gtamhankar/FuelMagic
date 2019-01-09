require('dotenv').config();
var db = require("../models");
var multer = require('multer');
var path = require('path');

module.exports = function(app) {

    // Init Upload
    const upload = multer({
      storage: multer.memoryStorage(),
      //limits:{fileSize: 1500000},
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

    app.post('/api/image', (req, res) => {
      upload(req, res, async (error) => {
        if(error){
          console.log(error);
          res.json({ error })
        } 
        else {
          if(req.file == undefined){
            res.json({ error: "No file present" })
          } else {
            console.log('Requesting OCR...')

            let ocr = await require('../fetchOCR')(req.file.buffer)

            console.log('Response received')

            if (!ocr) { res.json({}); return }

            let parsed = require('../parseReceipt')(ocr.string),
                place = await require('../fetchPlace')(ocr)

            res.json(Object.assign( place ? { place } : {}, ...parsed))
          }
        }
      });
    });
    
    app.post("/api/readings", function(req, res) {
       db.Reading.create({
           place:  req.body.place,
           address: req.body.address,
           gallons: req.body.gallons,
           price: req.body.total,
           perGallon: req.body.perGallon
       }).then(function(result) {
           res.json(result);
       });
    });



    app.get("/", function(req, res) {
        db.Reading.findAll({
           ////look to order in descend
           order: [['id', 'DESC']]
        }).then(function(data) {
           console.log(data);
           res.render("index", { readings: data });
            
        });
    });
    
    
    app.get("/database", function(req, res) {
        db.Reading.findAll({
           ////look to order in descend
        }).then(function(data) {
           console.log(data);
           res.json(data);
            
        });
    });

    app.delete("/api/delete/:id", function(req, res) {
        db.Reading.destroy({
          where: {
              id: req.params.id
          }
        }).then(function(dbReadings){
          res.json(dbReadings)
        });
    });

    app.get("/api/find/:id", function(req, res) {
        db.Reading.findOne({
        where: {
            id: req.params.id
        }
      }).then(function(dbReadings) {
        res.json(dbReadings);
      });
    });
    
    app.put("/api/update/:id", function(req, res) {
        db.Reading.update({
          place: req.body.place,
          address: req.body.address,
          gallons: req.body.gallons,
          price: req.body.total,
          perGallon: req.body.perGallon
        }, 
    { where: { id: req.params.id }
            
        }).then(function(result) {
            res.json(result);
        });
    });

    app.get("/api/lowest", function(req, res) {
        db.Reading.findAll({
           ////look to order in descend
           limit: 6,
           order: [['perGallon', 'ASC']]
        }).then(function(data) {
           console.log(data);
           res.render("lowest", { readings: data });
            
        });
    });

    app.get("/api/store", function(req, res) {
        db.Reading.findAll({
           ////look to order in descend
           limit: 6,
           order: [['place', 'ASC']]
        }).then(function(data) {
           console.log(data);
           res.render("store", { readings: data });
            
        });
    });

    app.post("/api/image", function(req, res) {
        res.json({
          id: 0,
          place: "Joe's Gas @ 123 Fake St",
          date: "2019-01-03",
          gallons: 9.142,
          price: 26.32,
          perGallon: 2.879
        });
      });
      
       app.get("/api/pricePerGallon", function(req, res) {
        db.Reading.findAll({           
           order: [['id', 'ASC']]
        }).then(function(dbReadings) {
        console.log (dbReadings);
		    res.json(dbReadings);		
      });
    });
/*
 app.get("/api/expensePerMonth", function(req, res) {       
        db.Reading.query("select price, concat(MONTH(createdAt) ,' - ' , YEAR(createdAt)) as vdate FROM readings WHERE createdAt is not null GROUP BY YEAR(createdAt) , MONTH(createdAt);" , { type: sequelize.QueryTypes.SELECT})
		.then(function(users) {
        console.log (users);
        res.json(users);		                
      });      
    }); 
    */

   app.get("/api/storeschart", function(req, res) {
    db.Reading.findAll({
		 attributes: [
    'place',
    [db.Reading.sequelize.literal('COUNT(place)'), 'countOfplace']
  ],
  group: 'place'			
		
    }).then(function(dbReadings) {
    console.log (dbReadings);
        res.json(dbReadings);		
  });
}); 

app.get("/api/expensePerMonth", function(req, res) {
    db.Reading.findAll({
        attributes: [ [
            db.Reading.sequelize.fn('sum',  db.Reading.sequelize.col('price')),
            db.Reading.sequelize.fn('MONTH', db.Reading.sequelize.col('createdAt')), 
            db.Reading.sequelize.fn('YEAR', db.Reading.sequelize.col('createdAt')) ] ] ,                    
        group:  [ db.Reading.sequelize.fn('YEAR', db.Reading.sequelize.col('createdAt')) , 
                  db.Reading.sequelize.fn('MONTH', db.Reading.sequelize.col('createdAt'))
                ]
    }).then(function(dbReadings) {
    console.log (dbReadings);
        res.json(dbReadings);		
  });
});


}