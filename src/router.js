const express = require('express');
const models = require('./mongodb/models');

const router = express.Router();

router.get('/reviews', (req, res) => {
  models
    .getReviews(req.query.product_id, req.query.page, req.query.count, req.query.sort)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

router.get('/reviews/meta', (req, res) => {
  models
    .getMetadata(req.query.product_id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

router.post('/reviews', (req, res) => {});

router.put('/reviews/:review_id/helpful', (req, res) => {});

router.put('/reviews/:review_id/report', (req, res) => {});

module.exports = router;
