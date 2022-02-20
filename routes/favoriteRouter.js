const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("./cors");

const Favorites = require("../models/favorites");

const favoriteRouter = express.Router();
const authenticate = require("../authenticate");

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite == null) {
            // (a) create a favorite document

            Favorites.create({ user: req.user._id, dishes: req.body }).then(
              (newFavorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(newFavorite);
              },
              (err) => next(err)
            );
          } else {
            // (b) add the dishes to the list of favorite dishes for the user

            req.body.forEach((favoriteDish) => {
              if (favorite.dishes.indexOf(favoriteDish._id) === -1) {
                favorite.dishes.unshift(favoriteDish._id);
              }
            });

            favorite.save().then(
              (updatedFavorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(updatedFavorite);
              },
              (err) => next(err)
            );
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // Not supported
    res.end("PUT operation not supported on /Favorites");
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // Not supported
    res.end("GET operation not supported on /Favorites/:dishId");
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.updateOne({ user: req.user._id }, { $addToSet: { dishes: req.params.dishId } })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // Not supported
    res.end("PUT operation not supported on /Favorites/:dishId");
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.updateOne({ user: req.user._id }, { $pull: { dishes: req.params.dishId } })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
