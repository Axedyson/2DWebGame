"use strict";

const mongoose = require('mongoose');

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB,
  MONGO_REPLICASET
} = process.env;

const options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
};

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?${MONGO_REPLICASET ? `replicaSet=${MONGO_REPLICASET}&` : ''}authSource=admin`;


mongoose.connect(url, options).then( function() {
  console.log('MongoDB is connected');
}).catch( function(err) {
  console.log(err);
});