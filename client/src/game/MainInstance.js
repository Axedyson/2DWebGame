import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

const initializeGameInstance = (initialWidth, initialHeight) => (
  new Phaser.Game({
    type: Phaser.AUTO,
    width: initialWidth,
    height: initialHeight,
    parent: 'phaser-container',
    scale: {
      // Could've used FIT but this seems to work better, because it takes the following user action into account:
      // Resize very fast
      mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT
    },
    physics: {
      default: 'arcade'
    },
    scene: [GameScene]
  })
);

export const prepareFullscreen = game => {
  // This is to make sure that phaser doesn't scale the canvas automatically
  game.scale.scaleMode = Phaser.Scale.NONE;
  
  // Remove all the applied inline styling on the canvas element
  game.canvas.removeAttribute("style");
  
  // Refresh so the disabled scaling takes affect
  game.scale.refresh();
};

export const cleanUpFullscreen = game => {
  // This is to make sure phaser falls back to the first setting to automatically scale the canvas
  game.scale.scaleMode = Phaser.Scale.WIDTH_CONTROLS_HEIGHT;

  // Refresh so the enabled scaling takes affect
  game.scale.refresh();
};

export default initializeGameInstance;