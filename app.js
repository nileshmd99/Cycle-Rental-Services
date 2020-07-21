const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://nile:nile1234@cluster0-mmrx9.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {poolSize: 10, bufferMaxEntries: 0, useNewUrlParser: true,useUnifiedTopology: true});
client.connect().then(client => {
    console.log('Connected to Database')
  });
const fs=require('fs');
const path = require("path") 
const multer = require("multer") 
const bodyParser = require('body-parser');
const express = require('express');
const app=express();
app.set("views",path.join(__dirname,"views")) 
app.set('view engine', 'ejs');
const maxSize = 10 * 1000 * 1000; 
app.use(bodyParser.urlencoded({ extended: true }))
const nodemailer=require('nodemailer');
const session = require('express-session');
app.use(session({secret:"Secret Key"}));
app.use(express.static(__dirname));
var storage = multer.diskStorage({ 
  destination: function (req, file, cb) { 
      cb(null, "uploads") 
  }, 
  filename: function (req, file, cb) { 
    cb(null, file.fieldname + "-" + Date.now()+".jpg") 
  } 
}) 
var upload = multer({ 
	storage: storage, 
	limits: { fileSize: maxSize }, 
	fileFilter: function (req, file, cb){ 
	
		// Set the filetypes, it is optional 
		var filetypes = /jpeg|jpg|png/; 
		var mimetype = filetypes.test(file.mimetype); 

		var extname = filetypes.test(path.extname( 
					file.originalname).toLowerCase()); 
		
		if (mimetype && extname) { 
			return cb(null, true); 
		} 
	
		cb("Error: File upload only supports the "
				+ "following filetypes - " + filetypes); 
	} 

// mypic is the name of file attribute 
}).single("mypic");	 
var port_number = app.listen(process.env.PORT || 3000);
app.listen(port_number,()=>{
    console.log('Now listening');
});

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
});
app.post('/usertype', (req, res) => {
    console.log(req.body)
    const collection1 = client.db("test").collection('usertype');
    collection1.insertOne(req.body)
    .then(result => {
      console.log(result)
      res.redirect('/' + req.body.user)
    })
    .catch(error => console.error(error))
  })
  
  app.get('/customer', (req, res) => {
    res.render('customer')
    
  })
  app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/adminlogin.html')
    
  })

  app.post('/admin1', (req, res) => {
    client.db("test").collection('customerdetails').find().toArray()
    .then(results => {
      if(req.body.username == "admin" && req.body.password == "admin"){
        res.render('index.ejs', { customerdetails: results })
    }
    else{
      res.send(req.body.username)
    }
  })
    .catch(/* ... */)})
  app.post('/usertype1', (req, res, next) => {
    console.log(req.body)
    const collection1 = client.db("test").collection('customerdetails');
    collection1.insertOne(req.body)
    .then(result => {
      console.log(result)
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'cyclerental242@gmail.com',
               pass: ''//intentionally hiding password
           },
        tls: {
            rejectUnauthorized: false
        }
       });
    
    const mailOptions = {
        from: 'cyclerental242@gmail.com',
        to: 'cyclerental242@gmail.com', 
        subject: 'New customer order', 
        html: "Hey Cycle-rental Admin, "+req.body.fname + " " + req.body.lname + " registered for "+ req.body.cycle + "." 
      };   

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err);
        else
          console.log(info);
     });
     res.redirect('/success');
     //res.render('index.ejs', { customerdetails: results })
    })
    .catch(error => console.error(error))
  })
  app.get("/success",function(req,res){ 
    res.render("Signup"); 
  })
  app.post("/uploadProfilePicture",function (req, res, next) { 
    upload(req,res,function(err) { 
  
      if(err) {
        res.send(err) 
      } 
      else { 
        res.redirect('/') 
      } 
    }) 
  }) 
