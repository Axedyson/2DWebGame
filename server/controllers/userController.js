"use strict";

const fs = require('fs');
const bcrypt = require('bcrypt');
const User = require("../models/user");
const { validationResult, body } = require('express-validator');
const formidable = require('formidable');
const readChunk = require('read-chunk');
const imageType = require('image-type');
const sharp = require('sharp');
const fetch = require('node-fetch');
const Hashids = require('hashids/cjs');
const {upload} = require('../spaces');
const {issueAT, issueRT} = require('../auth');

/* 
The following note applies for all the places where I call fs.unlinkSync():
I should proably use fs.unlink() instead as that is asynchronous.
In the future formdiable will not write files to disk:
https://github.com/node-formidable/formidable/issues/637#issuecomment-636085252 
*/

const secureCookie = JSON.parse(process.env.SECURE_COOKIE);
const hashids = new Hashids(process.env.HASHIDS_PIC_SALT);
const hCaptchaSecret = process.env.HCAPTCHA_SECRET;

const cookieOptions = {
  httpOnly: true, 
  secure: secureCookie, 
  sameSite: "lax",
  domain: secureCookie && ".circlefight.com"
};

const initializeLogin = (req, res, user, remember) => {
  const rToken = issueRT(user);
  // I'm not handling the cookie's inevitable expiration, because it's so far into the future that a lot will 
  // have changed by then (users clearing their cookies, etc.). It's sad that browsers/the specification doesn't allow permanent cookies,
  // but the expiration of the cookie is basically simulating a permanent cookie so it's fine!
  // I think that my users can tolerate one failure (forced logout) at some point in the future xD 
  // It's not worth it to send back the refresh_token cookie (renewing the expiration date for the cookie)
  // at the /refresh_token route (unnecessary bad performance) just to solve one failure in the far future!!
  cookieOptions.expires = remember ? new Date(Date.now() + new Date("2100").getTime()) : 0;
  res.cookie('r', rToken, cookieOptions);
  req.locals = "success";
};

const verifyHCaptcha = async req => {
  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST', 
    body: `secret=${hCaptchaSecret}&response=${req.body.captcha}&remoteip=${req.headers['x-forwarded-for']}`,
    headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'}
  });
  const data = await res.json();
  
  return data.success;
};

module.exports = {
  index: (req, res ,next) => {
    req.locals = "success";
    next();
  },
  validateSignup: (req, res, next) => {
    formidable().parse(req, async (err, fields, files) => {
      if (!err) {
        // Populate the req.body so it simulates a normal json payload request
        req.body = fields;
        req.body.image = files.image;
        
        await body("username").trim().isLength({min: 3, max: 20}).run(req);
        await body("image").optional().custom(() => (
          req.body.width && req.body.height && req.body.x && req.body.y
          )).custom(file => file.size <= req.app.get("FILE_SIZE")).custom(file => {
            const buffer = readChunk.sync(file.path, 0, imageType.minimumBytes);
            const obj = imageType(buffer);
            return obj && req.app.get('SUPPORTED_FORMATS').includes(obj.mime);
          }).run(req);
        await body("width").optional().custom(() => req.body.image).isInt().toInt().run(req);
        await body("height").optional().custom(() => req.body.image).isInt().toInt().run(req);
        await body("x").optional().custom(() => req.body.image).isInt().toInt().run(req);
        await body("y").optional().custom(() => req.body.image).isInt().toInt().run(req);
        // I need to trim here so curl post requests can't submit emails with leading and trailing whitespace!
        await body("email").trim().isEmail().normalizeEmail({all_lowercase: true}).run(req);
        await body("password").isLength({min: 5, max: 30}).run(req);
        await body("consent").isIn([true]).run(req);
        await body("remember").toBoolean().run(req);
        
        const hasErrors = !validationResult(req).isEmpty();
        const invalidCaptcha = !hasErrors && !(req.body.captcha && await verifyHCaptcha(req));
        const emailExists = !hasErrors && !invalidCaptcha && await User.exists({email: req.body.email});
        const usernameExists = !hasErrors && !invalidCaptcha && !emailExists && await User.exists({username: req.body.username});

        if (hasErrors) req.locals = {errors: {msg: "Your input didn't pass our server-side validation"}};
        else if (invalidCaptcha) req.locals = {errors: {msg: "There was an error with verifying your hCaptcha token"}};
        else if (emailExists) req.locals = {errors: {msg: "That email has already been taken sadly"}};
        else if (usernameExists) req.locals = {errors: {msg: "That username has already been taken sadly"}};
        else if (req.body.image) {

          const left = req.body.x;
          const top = req.body.y;
          const width = req.body.width;
          const height = req.body.height;
          const roundedCorners = Buffer.from('<svg><rect x="0" y="0" width="160" height="160" rx="80" ry="80"/></svg>');
          req.fileBuffer = await sharp(req.body.image.path).extract({left, top, width, height}).resize(160, 160)
          .composite([{input: roundedCorners, blend: 'dest-in'}]).toFormat('jpg').toBuffer();

        }
        if (hasErrors || invalidCaptcha || emailExists || usernameExists) req.skip = true;
      } else {
        req.locals = {errors: {msg: "Something went wrong with processing your input 😥"}};
        req.skip = true;
      }
      // Remove the file after use even if an error occurs
      if (req.body.image) fs.unlinkSync(req.body.image.path);
      next();
    });
  },
  create: async (req, res, next) => {
    if (!req.skip) {
      const hash = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({...req.body, password: hash});
      
      if (req.fileBuffer) {
        const filename = hashids.encodeHex(user.id);
        await upload(filename, req.fileBuffer);
        user.img = filename;
        await user.save();
      }
      initializeLogin(req, res, user, req.body.remember);
    }
    next();
  },
  validateLogin: async (req, res, next) => {
    await body("username").trim().isLength({min: 3, max: 20}).run(req);
    await body("password").isLength({min: 5, max: 30}).run(req);

    const hasErrors = !validationResult(req).isEmpty();
    const invalidCaptcha = !hasErrors && !(req.body.captcha && await verifyHCaptcha(req));
    
    if (hasErrors) req.locals = {errors: {msg: "Your input didn't pass our server-side validation"}};
    else if (invalidCaptcha) req.locals = {errors: {msg: "There was an error with verifying your hCaptcha token"}};

    if (hasErrors || invalidCaptcha) req.skip = true;

    next();
  },
  login: async (req, res, next) => {
    if (!req.skip) {
      const user = await User.findOne({username: req.body.username});
      if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
          initializeLogin(req, res, user, req.body.remember);
        } else req.locals = {errors: {msg: "Sorry but the password is incorrect"}};
      } else req.locals = {errors: {msg: "Sorry couldn't find a user with that username"}};
    }
    next();
  },
  logout: (req, res) => {
    res.clearCookie('r', cookieOptions);
    res.end();
  },
  profileLayout: (req, res ,next) => {
    const {username, image} = req.user;
    req.locals = {username, image};
    next();
  },
  account: (req, res, next) => {
    const {tokenVersion: sessionLogoutTimes, email, username, image} = req.user;
    req.locals = {sessionLogoutTimes, email, username, image};
    next();
  },
  refreshToken: (req, res, next) => {
    // The reason why I'm not calling initializeLogin() in here 
    // is so the refresh_token cookie will not be send back, if it were,
    // it would be bad for performance and I don't have an expiration date
    // on the refresh_token anyway, read more in the auth.js file for why
    req.locals = issueAT(req.user);
    next();
  },
  respond: (req, res) => {
    res.json(req.locals);
  }
};
