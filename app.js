// ======================
//         SETUP 
// ======================
var express = require("express");
var app = express();


var bodyParser = require("body-parser");
const mongoose = require('mongoose');
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
const fetch = require("node-fetch");
var cors = require("cors");
var Feed = require("feed-to-json");
const multer = require('multer');
const path = require('path');



var User = require("./models/user");
var db = require("./models");


// ======================
//       MULTER 
// ======================
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, file.filename + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage, 
    limits: {fileSize: 10000000},
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('uploadImage');


function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Image files only');
    }
}



// ======================
//       MONGOOSE 
// ======================
mongoose.connect('mongodb://localhost:27017/Hackathon', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log(error.message));




// ======================
//        PLUGINS 
// ======================
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json({limit: "1mb"}));
app.use(methodOverride("_method"));
app.use(flash());






// ======================
//        PASSPORT 
// ======================
app.use(require("express-session")({
    secret: "Benson is a cute black lurcher with a wonky smile",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});





// ======================
//        ROUTES
// ======================

app.get("/home", function(req, res) {
    res.render("landing", {user: req.user});

});



// ======================
//     AUTH ROUTES
// ======================

app.get("/", function(req, res) {
    res.render("login");
})



app.post("/login", function (req, res, next) {
    passport.authenticate("local",
        {
            successRedirect: "/home",
            failureRedirect: "/",
            failureFlash: true,
            successFlash: "Good Day " + req.body.username + "!"
        })(req, res);

});



app.get("/register", function (req, res) {
    res.render("register");
})

app.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username, email: req.body.email, image: req.body.image });

    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register", { error: err.message });
        } else if (req.body.password !== req.body.password2) {
            return res.render("register", { error: "Passwords do not match!" });

        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Good Day " + user.username);
            res.redirect("/home");
        });
    });
});




// ======================
//     PHOTO ROUTES
// ======================

app.get("/photos", function (req, res) {
    res.render("photos");
})


//PHOTO API INDEX
app.post("/upload", function (req, res) {
    upload(req, res, (err) => {
        if(err) {
            res.render('photos', {
                msg: err
            });
        } else {
            if(req.file === undefined) {
                res.render('photos', {
                    msg: 'Error: No File selected!'
                });
            }else {
                res.render('photos', {
                    msg: 'File Uploaded!',
                    file: `uploads/${req.file.filename}`
                });
            }
        }
    })
})







// ======================
//     NEWS ROUTES
// ======================
app.get("/news_feed", function (req, res) {
    Feed.load('http://feeds.bbci.co.uk/news/uk/rss.xml', function (err, rss) {
        if (err) {
            console.log(err)
        } else {
            res.send(rss);

        }
    });

      
    });





// ======================
//     TASK ROUTES
// ======================

// MAIN TASK PAGE 
app.get("/tasks", function (req, res) {
    res.render("tasks");
})


//TASK API INDEX
app.get("/api/tasks", function (req, res) {
    db.Task.find()
    .then(function(tasks) {
        res.json(tasks);
    })
    .catch(function(err) {
        res.send(err);
    })
})


// TASK API CREATE 
app.post("/api/tasks", function (req, res) {
    db.Task.create(req.body)
    .then(function(newTask) {
        res.status(201).json(newTask);
    })
    .catch(function(err){
        res.send(err);
    })
})



// TASK API SHOW
app.get("/api/tasks/:taskId", function(req, res) {
    db.Task.findById(req.params.taskId)
    .then(function(foundTask){
        res.json(foundTask)
    })
    .catch(function(err) {
        res.send(err);
    })
})



// TASK API UPDATE
app.put("/api/tasks/:taskId", function(req, res) {
    db.Task.findOneAndUpdate({_id:req.params.taskId}, req.body, {new: true})
        .then(function (Task) {
            res.json(Task)
        })
        .catch(function (err) {
            res.send(err);
        })
})



// TASK API DELETE
app.delete("/api/tasks/:taskId", function(req, res) {
    db.Task.remove({_id:req.params.taskId})
        .then(function () {
            res.json({message: "WE DELETED IT"})
        })
        .catch(function (err) {
            res.send(err);
        })
})
          















// ======================
//     INITIALISE 
// ======================
app.listen(3000, function (req, res) {
    console.log("Server has started");
})