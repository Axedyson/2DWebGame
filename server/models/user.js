"use strict";

const {IMAGEURL} = require("../spaces");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  img: {type: String, default: "default"},
  tokenVersion: {type: Number, default: 0 }
});

userSchema.virtual('image').get(function() {
  return `${IMAGEURL}/${this.img}`;
});

module.exports = mongoose.model("User", userSchema);