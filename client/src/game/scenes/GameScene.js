import Phaser from 'phaser';
import OutlineEffectLayer from 'phaser3-rex-plugins/plugins/outlineeffectlayer.js';
import BuildArcadeObject from 'phaser3-rex-plugins/plugins/buildarcadeobject.js';
import CircleMaskImage from 'phaser3-rex-plugins/plugins/circlemaskimage.js';

// To increase performance read:
// https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html#generateTexture
// https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/
// And also delete clouds that you can't see (clouds that overlap 100% with other clouds, where the smaller ones should be deleted!)

// Right now the circle object can sink into other objects which I don't want to
// follow this for potential solutions: https://www.html5gamedevs.com/topic/41338-prevent-pushing-other-object/
// http://labs.phaser.io/edit.html?src=src%5Cphysics%5Carcade%5Ccustom%20separate.js

// Here are some other useful links I think:
// https://codepen.io/samme/pen/NEwGeJ?editors=0010
// https://codepen.io/samme/pen/JjYLYEb?editors=0010

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('main');

    this.player = undefined;
    this.cursors = undefined;

    this.gameWidth = process.env.gameWidth + process.env.displayWidth;
    this.gameHeight = process.env.gameHeight + process.env.displayHeight;

    this.physicsBoundaryX = process.env.displayWidth / 2;
    this.physicsBoundaryY = process.env.displayHeight / 2;

    this.physicsBoundaryWidth = process.env.gameWidth;
    this.physicsBoundaryHeight = process.env.gameHeight;
  }

  preload() {
    // If I ever deploy this on DO then make sure to utilize their Object Storage cdn thing,
    // and delete & move the assets folder located inside the public folder to the cdn thing!
    this.load.image('pfp', 'assets/default.jpg');
  }

  create() {
    this.createCamera();

    this.obstacles = this.createWorld();
    this.player = this.createPlayer();

    // Apply collisions between the player and the obstacles
    this.physics.add.collider(this.player, this.obstacles);
  }

  createCamera() {
    // Apply camera view boundaries
    this.cameras.main.setBounds(0, 0, this.gameWidth, this.gameHeight);

    // Have to follow game objects like this, because following game objects with an applied outline effect like this:
    // this.cameras.main.startFollow(this.player); will not work. But it will work without the applied outline effect.
    // For reference: https://github.com/rexrainbow/phaser3-rex-notes/issues/116
    this.game.events.on('prerender', function () {
      if (this.player) this.cameras.main.centerOn(this.player.x, this.player.y);
    }, this);
  }

  createWorld() {
    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0479c3, 0x0479c3, 0x00e0ff, 0x00e0ff);
    graphics.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Create grid background
    const grid = this.add.grid(0, 0, this.gameWidth, this.gameHeight, 55, 55, null, null, 0xA0A0A0);
    grid.setOrigin(0);

    // Create a rectangle showing the boundaries of the physical world
    graphics.lineStyle(2, 0xFF0000);
    graphics.strokeRect(this.physicsBoundaryX, this.physicsBoundaryY, this.physicsBoundaryWidth, this.physicsBoundaryHeight);

    // Apply physics boundaries
    this.physics.world.setBounds(this.physicsBoundaryX, this.physicsBoundaryY, this.physicsBoundaryWidth, this.physicsBoundaryHeight);

    // Create obstacles
    return this.pcgAlgorithm("lol");
  }

  pcgAlgorithm(seed) {
    /*
    Random factors:
      1. placement of each cloud
      2. amount of clouds
      3. amount of circles within each cloud
      4. radius of each circle
      5. overlap of each circle
    */
    // Initialize the phaser RandomDataGenerator with the provided seed
    const r = Phaser.Math.RND;
    r.sow([seed]);

    const obstacles = this.physics.add.staticGroup();

    // 2. amount of clouds
    const amountOfClouds = r.integerInRange(40, 60);

    for (let i = 0; i < amountOfClouds; i++) {
      // 1. random placement of each cloud
      const startX = r.integerInRange(this.physicsBoundaryX, this.physicsBoundaryWidth + this.physicsBoundaryX);
      const startY = r.integerInRange(this.physicsBoundaryY, this.physicsBoundaryHeight + this.physicsBoundaryY);

      // 3. random amount of circles within each cloud
      const amountOfCircles = r.integerInRange(1, 10);

      // Keep track of all the circles we have currently added of the cloud that we are currently generating
      const currentCirclesOfCloud = [];

      // Keep track of the first time we execute code in the nested loop
      let firstTime = true;

      for (let j = 0; j < amountOfCircles; j++) {
        // 4. random radius of each circle
        const radius = r.integerInRange(10, 100);

        let x, y;

        if (firstTime) {
          x = startX;
          y = startY;
          firstTime = false;

        // 5. random overlap of each circle
        } else {
          const randomCircle = r.pick(currentCirclesOfCloud);

          // Found the following calculation code snippet here:
          // https://github.com/photonstorm/phaser/blob/v3.22.0/src/geom/circle/Random.js#L9
          // I've converted it to utilize our own RandomDataGenerator so it will take the seed into account!
          const t = 2 * Math.PI * r.frac();
          const u = r.frac() + r.frac();
          const r2 = (u > 1) ? 2 - u : u;
          const x2 = r2 * Math.cos(t);
          const y2 = r2 * Math.sin(t);

          x = randomCircle.x + (x2 * randomCircle.radius);
          y = randomCircle.y + (y2 * randomCircle.radius);
        }

        // Finally instantiate the circle and add it as a part of the static group and the currentCirclesOfCloud variable
        const obstacle = this.physics.add.existing(this.add.circle(x, y, radius, 0xffffff), true);
        obstacle.body.setCircle(radius);
        obstacles.add(obstacle);
        currentCirclesOfCloud.push(obstacle);
      }
    }

    return obstacles;
  }

  createPlayer() {
    // Create a circle mask over the image, and center the image/player on the game baord
    const image = new CircleMaskImage(this, this.gameWidth / 2, this.gameHeight / 2, 'pfp');
    this.add.existing(image);
    // Make it half the size so it's the same size as the profile picture (80 px)
    image.setScale(0.5);

    // Create an outline effect around the circle image
    const effectLayer = new OutlineEffectLayer(this, {thickness: 8, outlineColor: 0x33FF48});
    this.add.existing(effectLayer);
    effectLayer.add(image);

    // Make the circle image physical xD
    const player = BuildArcadeObject(image);
    player.setCircle(96, -16, -16);
    player.setCollideWorldBounds();

    // Create the cursor keys which the player will use
    this.cursors = this.input.keyboard.createCursorKeys();

    return player;
  }

  update() {
    if (this.cursors.left.isDown) this.player.setVelocityX(-500);
    else if (this.cursors.right.isDown) this.player.setVelocityX(500);
    else this.player.setVelocityX(0);

    if (this.cursors.down.isDown) this.player.setVelocityY(500);
    else if (this.cursors.up.isDown) this.player.setVelocityY(-500);
    else this.player.setVelocityY(0);
  }

  zoom() {
    // The zooming is optimised/accommodates for the 16:9 aspect ratio. (dividing width by 1600px and height by 900px,
    // the values are located in the next.config.js file)
    // So players who have a 16:9 monitor will actually have an advantage over other players who don't.
    // Don't know if it should be this way :/
    // It seems though that the popular game agario is doing the same thing. So I'm also going to do it xD
    const xZoomFactor = this.cameras.main.width / process.env.displayWidth;
    const yZoomFactor = this.cameras.main.height / process.env.displayHeight;

    // Use the higest zoom factor value as that will be the dominating factor to adjust the camera display area
    const finalZoomFactor = xZoomFactor > yZoomFactor ? xZoomFactor : yZoomFactor;

    // Set the zoom level to adjust how much the user can see after the user has reszied the window!
    this.cameras.main.setZoom(finalZoomFactor);
  }

  resetZoom() {
    // The first argument to setZoom has a default value of 1 which is what I need :)
    this.cameras.main.setZoom();
  }
}
