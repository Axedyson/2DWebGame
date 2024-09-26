"use strict";

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/* shared config options here */
const config = {
  target: 'serverless',
  reactStrictMode: true,

  env: {
    FILE_SIZE: 1024**2,
    SUPPORTED_FORMATS: [
      "image/jpg",
      "image/jpeg",
      "image/png"
    ],

    // The reason why I'm not setting it to 20 min is because of the potential delay
    // (over 20 minutes since retrieving the access token) that the request for the refresh token
    // on the client side will have.
    REFRESH_TIMEOUT: 1000 * 60 * 19,

    HCAPTCHA_SITEKEY: "8fd35ea7-9153-4100-a1a1-9128079e72b0",

    gameWidth: 3000,
    gameHeight: 3000,
    // Remember when changing the initial dimensions then keep in mind how much the user will see of the world!!
    initialWidth: 800,
    initialHeight: 600,
    // These two values must together have an aspect ratio of 16:9 !! 
    // These two values controls the maximum amount of how much the camera can see of the game board
    displayWidth: 1600,
    displayHeight: 900
  }
};

module.exports = phase => {
  
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    /* development only config options here */

    config.env.SDOMAIN = 'http://server:8080';

    // The reason why I'm setting reactStrictMode to false in development is so
    // Material-UI can function properly as it can't when setting it to true apparently.
    // An example would be the box Component className mismatch warnings :(
    // In a new version this is most likely fixed hopefully so I can go back to setting it to true
    // in development again!
    // (only need to delete this comment and the line where it is being set to false)
    // Link for the new potential version: https://github.com/mui-org/material-ui/issues/20012
    config.reactStrictMode = false;

  } else {
    /* production and all other phases except development config options here */

    config.env.SDOMAIN = 'http://server';
  }
  
  return config;
};