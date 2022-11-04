const express = require('express');

const router = express.Router();

router.get('/reviews', (req, res) => {});

router.get('/reviews/meta', (req, res) => {});

router.post('/reviews', (req, res) => {});

router.put('/reviews/:review_id/helpful', (req, res) => {});

router.put('/reviews/:review_id/report', (req, res) => {});

module.exports = router;
