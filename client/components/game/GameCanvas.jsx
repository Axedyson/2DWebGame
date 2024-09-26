import initializeGameInstance, { prepareFullscreen, cleanUpFullscreen } from '../../src/game/MainInstance';
import { useEffect, useState, useRef } from 'react';
import IconButton from '@material-ui/core/IconButton';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

// Make sure to register event handlers which are related to specific React code in this file
// Otherwise register them in the game files located in src/game folder

// To avoid running any game js related code server side, import this component using next.js dynamic function
// with the following option set: ssr: true
const GameCanvas = ({initialWidth, initialHeight}) => {
  const [newHeight, setNewHeight] = useState(initialHeight);
  const [fullscreen, setFullscreen] = useState(false);
  const ready = useRef(false);
  const game = useRef();
  
  // Initialize the game!
  useEffect(() => {
    game.current = initializeGameInstance(initialWidth, initialHeight);
    
    return () => {
      game.current.destroy(true);
    };
  }, []);
  
  // This function has been made so the canvas element can properly resize
  // as it didn't do it quite well (it created extra annoying space (extra margin space) for some reason) :/
  useEffect(() => {
    let resizePhaserContainer;
    
    if (!fullscreen) {
      resizePhaserContainer = (gameSize, baseSize, displaySize) => {
        const updatedHeight = displaySize._height;
        // This is not the best way for rounding numbers but it solves my problem sufficiently
        const roundedHeight = Math.round(updatedHeight * 10) / 10;
        setNewHeight(roundedHeight);
      };
      
      game.current.scale.addListener('resize', resizePhaserContainer);
      // Refresh the scale manager so the resizePhaserContainer callback will run
      // We do this to update the div#phaser-container max-height to reflect the currently correct height on the canvas.
      // This solution only applies to the problem with the annoying extra generated space when the user loads the canvas with different
      // dimensions than the supplied ones from the index.jsx page file!
      game.current.scale.refresh();
    }
    
    return () => {
      if (!fullscreen) game.current.scale.removeListener('resize', resizePhaserContainer);
    };
  }, [fullscreen]);
  
  useEffect(() => {
    let mql;
    let resolution;
    let updateResolution;
    let readyListener;
    let resizeCanvas;
    let handleEsc;
    
    if (fullscreen) {
      mql = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

      // timeoutCallback for debounce mechanism for the resize canvas event handler
      let timeoutResizeCallback;
      resizeCanvas = () => {
        // Prevent execution of previous setTimeout
        clearTimeout(timeoutResizeCallback);
        // Resize every 150 milliseconds as a minimum!
        timeoutResizeCallback = setTimeout(() => {
          const scaledWidth = Math.floor(window.innerWidth * resolution);
          const scaledHeight = Math.floor(window.innerHeight * resolution);
          game.current.scale.resize(scaledWidth, scaledHeight);
          // Loops through all the current active scenes and zooms them in and out depending on the users window resizing
          // Since I only have one scene I could make a call to getScene(key):
          // https://photonstorm.github.io/phaser3-docs/Phaser.Scenes.SceneManager.html#getScene__anchor
          // But this is more flexible (maybe I will create more active scenes in the future that have their own zoom methods)
          for (let scene of game.current.scene.getScenes()) if (scene.zoom) scene.zoom();
        }, 150);
      };

      // timeoutCallback for debounce mechanism for the escape key event handler
      let timeoutEscCallback;
      handleEsc = event => {
        if (event.keyCode === 27) {
          // Whenever the user presses "esc" then we should always clear a potential previous timeout call!
          // So we don't make a call to setFullscreen(false); unnecessarily which could irritate the user
          clearTimeout(timeoutEscCallback);
          // if we are not ready yet (the canvas isn't done resizing) then we trigger a future call to setFullscreen(false);
          // By making a call 150 milliseconds into the future so the users fullscreen request gets fulfilled
          if (!ready.current) {
            timeoutEscCallback = setTimeout(() => {
              // if ready.current happens to still be false then we do nothing and the user have to press "esc" again
              // I guess we could call setTimeout(thisCallback, 150) recursively whenever ready.current is false but that could
              // potentially confuse and irritate the user
              if (ready.current) setFullscreen(false);
            }, 150);
          } else setFullscreen(false);
        }
      };

      updateResolution = () => {
        resolution = window.devicePixelRatio;
        // Resize the canvas again after updated resolution!
        // The problem with this is that the canvas will be resized twice everytime the user zooms in and out as zooming
        // apparently generates a resize event :/
        // I have to have this since when dragging a window to another screen with a different resolution
        // will not generate a resize event, so I need to call the resizeCanvas(); manually here!
        resizeCanvas();
      };

      readyListener = () => {
        ready.current = true;
      };
      
      prepareFullscreen(game.current);

      // Even though this event handler is only registered once I'm still removing it during cleanup.
      // Since the user can close the browser before the event handler gets called resulting in that the event handler doesn't get removed on unmount. 
      // Note I have to add this after the statement above for this to work apparently
      // We set ready.current to true only after a resize event has been triggered, so the esc handler only works at that point
      game.current.scale.once('resize', readyListener);
      
      mql.addListener(updateResolution);
      updateResolution();
      
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      // Maybe I should also clenaup the timeout things on unmount inside this if statement
      // But it's not worth it to have extra lines of code to avoid running code 150 milliseconds into the future
      if (fullscreen) {
        window.removeEventListener('keydown', handleEsc);
        window.removeEventListener('resize', resizeCanvas);
        mql.removeListener(updateResolution);
        // Loops through all the current active scenes and resets the zoom level
        // Since I only have one scene I could make a call to getScene(key):
        // https://photonstorm.github.io/phaser3-docs/Phaser.Scenes.SceneManager.html#getScene__anchor
        // But this is more flexible (maybe I will create more active scenes in the future that have their own zoom methods)
        for (let scene of game.current.scene.getScenes()) if (scene.resetZoom) scene.resetZoom();
        game.current.scale.removeListener('resize', readyListener);
        ready.current = false;
        cleanUpFullscreen(game.current);
        // When the canvas has been resized the user can immediately resize the window as the person pleases
        game.current.scale.setGameSize(initialWidth, initialHeight);
      }
    };
  }, [fullscreen]);
  
  const handleClick = () => {
    setFullscreen(true);
  };

  // Remember when styling the parent container (div#phaser-container): 
  // https://photonstorm.github.io/phaser3-docs/Phaser.Scale.ScaleManager.html#toc2__anchor
  return (
    <>
      <Box mx='auto' className="phaser-container">
        <Paper elevation={3}>
          <div id="phaser-container" />
        </Paper>
        <Grid container justify="flex-end">
          <Grid item>
            <IconButton color="primary" aria-label="toggle fullscreen mode" onClick={handleClick}>
              <FullscreenIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      {!fullscreen ?
        <style jsx global>{`
          .phaser-container {
            max-width: ${initialWidth}px;
          }
          #phaser-container {
            max-height: ${newHeight}px;
            border-radius: 4px;
          }
        `}</style>
        :
        <style jsx global>{`
          * {
            visibility: hidden;
            overflow: hidden;
          }
          canvas {
            visibility: visible;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
          }
        `}</style>
      }
    </>
  );
};

export default GameCanvas;  