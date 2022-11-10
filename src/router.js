const express = require('express');
const path = require('path');
const models = require('./mongodb/models');

const router = express.Router();

router.get('/loaderio-81b88f6bcd718a7484d1fca2265c758f', (req, res) => {
  res.sendFile(path.join(__dirname, `../${process.env.LOADERIO_FILE}`));
});

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

router.post('/reviews', (req, res) => {
  models.addReview(req.body).then(() => res.sendStatus(201));
});

router.put('/reviews/:review_id/helpful', (req, res) => {
  models.incrementHelpfulness(req.params.review_id).then(() => res.sendStatus(200));
});

router.put('/reviews/:review_id/report', (req, res) => {
  models.updateReview(req.params.review_id, { reported: true }).then(() => res.sendStatus(200));
});

module.exports = router;
