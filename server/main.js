"use strict";

const express = require("express");
// Pass potential asynchronous errors to my custom error handler
require('express-async-errors');
const app = express();
const morgan = require("morgan");
const router = require("./routes/index");
const passport = require('passport');
const httpStatus = require("http-status-codes");
const {configure} = require("./auth");

// Set environment variables
app.set("port", 8080);
app.set("FILE_SIZE", 1024**2);
app.set("SUPPORTED_FORMATS", [
  "image/jpg",
  "image/jpeg",
  "image/png"
]);

// Initialize mongodb database
require("./db.js");

// Initialize jwt authentication
configure(passport);
app.use(passport.initialize());

// Accept json payloads
app.use(express.json());

// Logging request output
app.use(morgan(app.get("env") === 'production' ? "combined" : ":method :status :response-time ms - :res[content-length] - :url "));

// Initialize all my routes
app.use(router);

// Error middlewares, sad that 500 error middleware couldn't be inside a child router to catch all errors :(
app.use((req, res) => {
  res.status(httpStatus.NOT_FOUND).json({errors: {msg: "Sorry could not find the resource."}});
});
app.use((error, req, res, next) => {
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({errors: {msg: error ? error.message : "Unknown Error."}});
});

// Finally start server
app.listen(app.get("port"), () => {
  console.log(`Server running in ${app.get('env')} environment, ready on http://127.0.0.1:${app.get('port')}`);
});