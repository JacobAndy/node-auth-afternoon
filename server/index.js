//IMPORT ALL DEPENDENCIES THAT I NEED TO WORK WITH
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const students = require("../students.json");

const app = express();
//SESSION SET UP
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000000
    }
  })
);
//AUTH0 SETUP
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new Auth0Strategy(
    {
      domain: process.env.DOMAIN,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/login",
      scope: "openid email profile"
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  });
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

//END POINTS

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login"
    // connection: "github"
  })
);

function authenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: "unauthorized" });
  }
}

app.get("/students", authenticated, (req, res, next) => {
  res.status(200).json(students);
});

//SERVER CALLING
const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
