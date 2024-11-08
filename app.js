// npm init -y
// npm i express ejs mongoose nodemon ejs-mate joi express-session connect-flash passport passport-local passport-local-mongoose
// Libraries:
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // For using layout in ejs same include/partials
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";



// Models:
const User = require("./models/user.js");


// Routes:
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error("Something went wrong", err);
  });


const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 64 * 64 * 1000,   // Data.now() gives current time in milliseconds. 7 * 24 * 64 * 64 * 1000 which shows 7 days in milliseconds. So, cookie will expire in 7 days. Same as Github login account. Cookie will save in browser
    maxAge: 7 * 24 * 64 * 64 * 1000,
    httpOnly: true,    // Cookie will only be accessed by http request not by javascript/ Cross Site Scripting(XSS)
  },
};
app.use(session(sessionOptions));    // If cookie shows up in browser then session is working
app.use(flash());   // Flash is used to show message to user. It is used to show message to user after some action like after login, after logout, after adding new listing etc. Note: Flash is defined after our listing routes defined in app.use("/listings", listings) and app.use("/listings/:id/reviews", reviews)


// Passport Configuration
app.use(passport.initialize());   // A middleware to initialize passport
app.use(passport.session());    // A middleware to use passport session. It is used to keep track of user's login status. 
passport.use(new LocalStrategy(User.authenticate()));   // LocalStrategy is used to authenticate user. User.authenticate() is a method provided by passport-local-mongoose
passport.serializeUser(User.serializeUser());   // serializeUser: 
passport.deserializeUser(User.deserializeUser());   // deserializeUser



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  // console.log("Success", res.locals.success);
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;   // req.user is set by passport. It is used to check whether user is logged in or not
  next();
});

app.get("/", (req, res) => {
  res.send("Hi I am root route");
});

app.get("/demoUser", async (req, res) => {
  const fakeUser = new User({ email: "shabbar1@gmail.com", username: "shabbar1" });     // Password is not saved in database. It is hashed and saved in database. PbKdf2 algroithm(in passport by default) is used to hash password 

  const newUser = await User.register(fakeUser, "password");
  res.send(newUser);
});


app.use("/listings", listingsRouter);   // This is defined after app.use(flash()) because flash is used to show message to user
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// app.get("/testlistings", async (req, res) => {
//   const sampleListing = new Listing({
//     title: "My new Villa",
//     description: "This is a beautiful villa",
//     price: 200000,
//     location: "Mumbai",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("Listing saved");
//   res.send("Listing saved");
// });



app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


// Error Handling Middleware:
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message)
});
app.listen(8080, () => {
  console.log(`Server is running on port 8080`);
});
