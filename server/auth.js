"use strict";

const JwtStrategy = require('passport-jwt').Strategy;
const User = require("./models/user");
const jwt = require('jsonwebtoken');
const fs = require('fs');

/*
I'm not explicitly revoking any tokens when the user logs out
since I think it's bad UX because the user would then be logged out
on every device he/her was previously logged in on. I'm doing this knowingly
that it sacrifices some security.

What I could is generate a unique token for every login and then revoke that on logout.
But that would probably require redis or a db and more db lookups than I already have
which is bad for performance and kind of defeats the purpose of jwt even more 
(I should have just used classic sessions and redis in the first place I think) :(
*/

// Script for generating keys: https://github.com/zachgoll/express-jwt-authentication-starter/blob/master/generateKeypair.js
const A_PUB_KEY = fs.readFileSync('./keys/a_rsa_pub.pem', 'utf8');
const A_PRI_KEY = fs.readFileSync('./keys/a_rsa_pri.pem', 'utf8');

const R_PUB_KEY = fs.readFileSync('./keys/r_rsa_pub.pem', 'utf8');
const R_PRI_KEY = fs.readFileSync('./keys/r_rsa_pri.pem', 'utf8');

// expiresIn only applies to the access token
const expiresIn = '20m';
const algorithm = 'RS256';

const accessOptions = {
  jwtFromRequest: require('passport-jwt').ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: A_PUB_KEY,
  algorithms: [algorithm]
};

const refreshOptions = {
  jwtFromRequest: req => req && req.cookies ? req.cookies['r'] : null,
  secretOrKey: R_PUB_KEY,
  algorithms: [algorithm]
};

const getJwtPayload = user => {
  const sub = user.id;
  const v = user.tokenVersion;
  return {sub, v};
};

const verify = (jwt_payload, done) => {
  User.findById(jwt_payload.sub, (err, user) => {
    if (err) return done(err, false);
    // Since we are here, the JWT is valid
    if (user && user.tokenVersion === jwt_payload.v) return done(null, user);
    else return done(null, false);
  });
};

// main.js will pass the global passport object here, and the configure function will configure it xD
module.exports = {
  configure: passport => {
    passport.use('access', new JwtStrategy(accessOptions, verify));
    passport.use('refresh', new JwtStrategy(refreshOptions, verify));
  },
  issueAT: user => jwt.sign(getJwtPayload(user), A_PRI_KEY, {algorithm, expiresIn}),
  // I'm not expiring the refresh_token since I think it's bad UX 
  // because the user could suddenly think "oh I'm logged out what happened?"
  // The above scenario could happen if the user has been logged in for a very long time 
  // (longer than the hypothetical expiration date of the refresh_token).
  // If the refresh_token did have an expiration date then I could send back a new refresh_token everytime 
  // the user requests for a new access_token so the new refresh_token expiration time would be renewed!
  // Which is fine but it would decrease performance a little bit I think.
  // I'm doing this knowingly that it sacrifices some security.
  issueRT: user => jwt.sign(getJwtPayload(user), R_PRI_KEY, {algorithm})
};