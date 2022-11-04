const express = require('express');
const morgan = require('morgan');
const router = require('./router');

const app = express();

app.use(morgan('combined'));
app.use(express.json());

app.use(router);
