const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Promotions = require("../models/promotions");

const promoRouter = express.Router();
const verifyUser = require("../authenticate").verifyUser;

promoRouter.use(bodyParser.json());

promoRouter
  .route("/")

  .get((req, res, next) => {
    Promotions.find({})
      .then(
        (promotions) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotions);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(verifyUser, (req, res, next) => {
    Promotions.create(req.body)
      .then(
        (promotion) => {
          console.log("Promotion created", promotion);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .put(verifyUser, (req, res, next) => {
    res.statusCode = 403; // Not supported
    res.end("PUT operation not supported on /promotions");
  })

  .delete(verifyUser, (req, res, next) => {
    Promotions.remove({})
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

promoRouter
  .route("/:promoId")

  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promotion) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(verifyUser, (req, res, next) => {
    res.statusCode = 403; // Not supported
    res.end("POST operation not supported on /promotions/" + req.params.promoId);
  })

  .put(verifyUser, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, { $set: req.body }, { new: true })
      .then(
        (promotion) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .delete(verifyUser, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
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

module.exports = promoRouter;
