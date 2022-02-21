const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("./cors");

const Users = require("../models/users");
const authenticate = require("../authenticate");

const userRouter = express.Router();

userRouter.use(bodyParser.json());

userRouter.options("*", cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

userRouter.get("/", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Users.find({})
    .then(
      (users) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

userRouter.post("/signup", cors.corsWithOptions, (req, res, next) => {
  Users.register(new Users({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err: err });
    } else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      }

      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }

      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json({ err: err });
          return;
        }

        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: true, status: "Registration Successful!" });
        });
      });
    }
  });
});

userRouter.post("/login", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({ success: false, status: "Login Unsuccessful!", err: info });
    }

    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        return res.json({ success: false, status: "Login Unsuccessful!", err: "Could not log in user!" });
      }

      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, status: "Login Successful!", token: token });
    });
  })(req, res, next);
});

userRouter.get("/checkJWTtoken", cors.corsWithOptions, (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT invalid!", success: false, err: info });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT valid!", success: true, user: user });
    }
  })(req, res);
});

userRouter.get("/facebook/token", cors.corsWithOptions, passport.authenticate("facebook-token"), (req, res) => {
  if (req.user) {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, token: token, status: "You are successfully logged in!" });
  }
});

module.exports = userRouter;
