const express = require("express"),
      app = express(),
      mongoose = require("mongoose"),
      router = require("./routes/index"),
      layouts = require("express-ejs-layouts"),
      ejs = require("ejs"),
      methodOverride = require("method-override"),
      expressSession = require("express-session"),
      cookieParser = require("cookie-parser"),
      connectFlash = require("connect-flash"),
      expressValidator = require("express-validator"),
      passport = require("passport");


// обещания стать чище и добрее
mongoose.Promise = global.Promise;

// setting headers for getting API-data
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//connecting to DB
mongoose.connect(process.env.MONGODB_URI ||
  "mongodb://localhost:27017/acro_db",
  {useNewUrlParser: true}   );

// Что это - об этом не было в книге, взял из гитхаба
  mongoose.set("useCreateIndex", true);

const db = mongoose.connection;

db.once("open", () => {
  console.log("Successfully connected to AcroDB!")
});

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(layouts);
//app.set('layout','admin/layout');

//without this req.body remain UNDEFINED!!!
app.use(
  express.urlencoded({
    extended: false
  })
);


app.use(methodOverride("_method", {
  methods: ["POST", "GET"]
}));

app.use(express.json());
// примочки из урока 22
app.use(cookieParser("secret_passcode"));
app.use(expressSession({
  secret: "secret_passcode",
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false
}));

// активируем паспортину
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(connectFlash());
// вот это должно быть после паспортных дел,
// иначе не фурычат currentUser & loggedIn
app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});

app.use(expressValidator());

app.use("/", router);



const server = app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
}),
io = require("socket.io")(server);
require("./controllers/chatController")(io);
