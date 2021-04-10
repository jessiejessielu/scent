const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const bodyParser= require('body-parser'); //handles reading data from forms
const hbs = require('hbs'); //templating engine
var request = require('request');
var fs = require("fs");
const MongoClient = require('mongodb').MongoClient; //database
const objectId = require('mongodb').ObjectID;
var session = require('express-session');
const { response } = require('express');
const { createBrotliCompress } = require('zlib');
const { EWOULDBLOCK } = require('constants');
//const MongoStore = require("connect-mongo")(session);
var MongoDBStore = require('connect-mongodb-session')(session);

var PORT = process.env.PORT || 3000;

const app = express();

var url="mongodb+srv://corawan:admin@cluster0.palg8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var db;

//connect to the MongoDB
MongoClient.connect(url, (err, client) => { //this is localhost connection string, for cloud drop the connection string, the localhost address: mongodb+srv://corawan:admin@cluster0.palg8.mongodb.net/test?authSource=admin&replicaSet=atlas-l4f3ow-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true
  if (err) return console.log(err);

  db = client.db('scent'); //Sets the database to work with

  //starts a server
  app.listen(PORT, () => {
    console.log('listening on port 3000')
  })
})

// session-based authentication

app.use(session({
    key: "user_sid",
    secret: "secret",  //used to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: { //Object for the session ID cookie.
    expires: 600000,  //cookies on the browser for 6 days
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('viewEngine', 'hbs' );

const redirectLogin = (req, res, next)=>{
    if(!req.session.userId){
        res.redirect('/login')
    }else{
        next()
    }
}

const redirectImage = (req, res, next)=>{
    if(req.session.userId){
        res.redirect('/upload')
    }else{
        next()
    }
}



// for image upload

app.use(express.static(path.join(__dirname, 'public')))

app.use(fileUpload(
//     {
//     useTempFiles: true,
//     tempFileDir: path.join(__dirname, 'tmp'),
//     createParentPath:true,
//     limit:{fileSize:1024}
// }
));



//routing the "landing page/sign in" form
app.get('/', (req, res) => {
    res.render('index.hbs'); //by default, hbs views are placed in a "views" folder
})

app.get('/signup', redirectImage, (req, res) => {
    res.render('signup.hbs');
})

app.post('/signup', redirectImage, (req, res) => {

    db.collection('user').insertOne(req.body, (err, result) => {
     if (err) return console.log(err)

     console.log('saved to database') //debug console message
     res.redirect('/login')
   })
  })

var sess; var thePassword; var theEmail; var user; var password; var fileName;

app.get('/login', redirectImage, (req, res) => {
  res.render('login.hbs'); //by default, hbs views are placed in a "views" folder
})

app.post('/login', redirectImage, (req, res, next) => {

  theEmail = req.body.email;
  thePassword = req.body.password;

  // if (theUEmail === "" || thePassword === "") {
  //     res.render("/login", {
  //             errorMessage: "Please enter both, email and password to sign up."
  //  })};

  db.collection('user').find({email: theEmail})
  .next()
  .then(user => {
      console.log(user);
      console.log(user.username);
      console.log(user.email);
      console.log(user.password);
      console.log(user._id);

      //return user;
      if(user.password === thePassword){
          req.session.userId = user._id;
          console.log(req.session.userId);
         res.redirect('/upload')
          // res.render('image.hbs',{
          //     user:user.username  })

      }else{
          res.send('Incorrect Username and/or Password!');
      }

  });


})



app.get('/logout', redirectLogin , (req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/')
    })
} )





  // routing photo upload

  app.get('/upload', redirectLogin, (req, res, next) => {
    res.render('upload.hbs');
})


app.get('/image', redirectLogin, (req, res) => {
    db.collection('person').find({email:theEmail}).toArray((err, result) => {
        if (err) return console.log(err)
        //To pass variables to a view, include an object as a second parameter. Here we pass "result" data.
    //The view will reference it as "notes"
    res.render('all.hbs', {person: result}) //by default, hbs views are placed in a "views" folder.
})
})


app.get('/happy', redirectLogin, (req, res) => {
    db.collection('person').find({email:theEmail, emotion:"happiness"}).toArray((err, result) => {
        if (err) return console.log(err)
        //To pass variables to a view, include an object as a second parameter. Here we pass "result" data.
    //The view will reference it as "notes"
    res.render('happy.hbs', {person: result}) //by default, hbs views are placed in a "views" folder.
})
})

app.get('/sad', redirectLogin, (req, res) => {
    db.collection('person').find({email:theEmail, emotion:"sadness"}).toArray((err, result) => {
        if (err) return console.log(err)
        //To pass variables to a view, include an object as a second parameter. Here we pass "result" data.
    //The view will reference it as "notes"
    res.render('sad.hbs', {person: result}) //by default, hbs views are placed in a "views" folder.
})
})

app.get('/anger', redirectLogin, (req, res) => {
    db.collection('person').find({email:theEmail, emotion:"anger"}).toArray((err, result) => {
        if (err) return console.log(err)
        //To pass variables to a view, include an object as a second parameter. Here we pass "result" data.
    //The view will reference it as "notes"
    res.render('angry.hbs', {person: result}) //by default, hbs views are placed in a "views" folder.
})
})

app.get('/neutral', redirectLogin, (req, res) => {
    db.collection('person').find({email:theEmail, emotion:"neutral"}).toArray((err, result) => {
        if (err) return console.log(err)
        //To pass variables to a view, include an object as a second parameter. Here we pass "result" data.
    //The view will reference it as "notes"
    res.render('neutral.hbs', {person: result}) //by default, hbs views are placed in a "views" folder.
})
})

app.get('/surprise', redirectLogin, (req, res) => {
    db.collection('person').find({email:theEmail, emotion:"surprise"}).toArray((err, result) => {
        if (err) return console.log(err)
        //To pass variables to a view, include an object as a second parameter. Here we pass "result" data.
    //The view will reference it as "notes"
    res.render('surprised.hbs', {person: result}) //by default, hbs views are placed in a "views" folder.
})
})




app.post('/upload', async(req, res, next) => {
    try{
        const file = req.files.iFile;
        const fileName = new Date().getTime().toString() + path.extname(file.name);
        const savePath = path.join(__dirname, 'public', 'images', fileName)
        await file.mv(savePath)

        //emotions
        var options = {
        	method: 'POST',
        	url: "https://api.luxand.cloud/photo/emotions",
        	qs: {},
        	headers: {
        		'token': "83cfc4b743a447228c23e1d3b35d745a"
        	},
        	formData: {
        		photo: fs.createReadStream(savePath)
        	}
        }; // end of options

        request(options, function (error, response, body) {
        	if (error) throw new Error(error);
            var myObj = JSON.parse(body);
        //    var myObj = JSON.parse(body).faces.emotions;
            var emotions = myObj.faces[0].emotions;

            var allemotions=[];
            var level=[];

            if (emotions.happiness){
                console.log("happiness:"), console.log(emotions.happiness),
                allemotions.push("happiness"), level.push(emotions.happiness)
            };
            if (emotions.sadness) { console.log("sadness:"), console.log(emotions.sadness), allemotions.push("sadness"),level.push(emotions.sadness);}
            if (emotions.surprise){ console.log("surprise:"), console.log( emotions.surprise), allemotions.push("surprise"),level.push(emotions.surprise);}
            if (emotions.anger){ console.log("anger:"),console.log( emotions.anger), allemotions.push("anger"),level.push(emotions.anger);}
            if (emotions.neutral) {console.log("neutral:"), console.log( emotions.neutral), allemotions.push("neutral"),level.push(emotions.neutral)}

            console.log(allemotions)
            console.log(level)


        var data ={
                    email: theEmail,
                    name: req.body.name,
                    imageName: fileName,
                    emotion: allemotions,
                    level: level,
                }

                db.collection('person').insertOne(data, (err, result) => {
                       if (err) return console.log(err)
                       console.log(data)
                       console.log('saved to database') //debug console message
                       res.redirect('/image')
                     })

        });// end of request
    }catch (error) {
        console.log(error)
        res.send('error uploading file')
    }

})

app.post('/multiple', async (req, res, next) => {
    try {
        const files = req.files.iFiles;
        let filePaths=[];
        const promises = files.map((file) => {
            const fileName = new Date().getTime().toString() + path.extname(file.name);
            const savePath = path.join(__dirname, 'public', 'images', fileName);
            filePaths.push(savePath);
            return file.mv(savePath)
          })
        
    //   res.redirect('/')
        filePaths.forEach(filePath=>{
            //emotions
                var options = {
                    method: 'POST',
                    url: "https://api.luxand.cloud/photo/emotions",
                    qs: {},
                    headers: {
                        'token': "83cfc4b743a447228c23e1d3b35d745a"
                    },
                    formData: {
                        photo: fs.createReadStream(filePath)
                    }
                }; // end of options
                
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    console.log(filePath);
                    var myObj = JSON.parse(body);
                //    var myObj = JSON.parse(body).faces.emotions;
                    var emotions = myObj.faces[0].emotions;

                    var allemotions=[];
                    var level=[];

                    if (emotions.happiness){
                        console.log("happiness:"), console.log(emotions.happiness),
                        allemotions.push("happiness"), level.push(emotions.happiness)
                    };
                    if (emotions.sadness) { console.log("sadness:"), console.log(emotions.sadness), allemotions.push("sadness"),level.push(emotions.sadness);}
                    if (emotions.surprise){ console.log("surprise:"), console.log( emotions.surprise), allemotions.push("surprise"),level.push(emotions.surprise);}
                    if (emotions.anger){ console.log("anger:"),console.log( emotions.anger), allemotions.push("anger"),level.push(emotions.anger);}
                    if (emotions.neutral) {console.log("neutral:"), console.log( emotions.neutral), allemotions.push("neutral"),level.push(emotions.neutral)}

                    console.log(allemotions)
                    console.log(level)


                var data ={
                            email: theEmail,
                            name: req.body.name,
                            imageName: fileName,
                            emotion: allemotions,
                            level: level,
                        }

                        db.collection('person').insertOne(data, (err, result) => {
                            if (err) return console.log(err)
                            console.log(data)
                            console.log('saved to database') //debug console message
                            res.redirect('/thisimage')
                            })

                });// end of request
        })
            
        await Promise.all(promises);
    } catch (error) {
      console.log(error)
      res.send('Error uploading files...')
    }
  })
