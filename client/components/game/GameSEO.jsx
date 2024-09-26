import Skeleton from '@material-ui/lab/Skeleton';
import { useEffect, useState, useRef } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

/*
This component serves the purpose of showing a loading state before
the other main game canvas has loaded, by rendering a canvas with the exact same size as the main
canvas, plus a material ui skeleton component!
This also serves the purpose of good SEO performance as search engines can read the text
between the canvas tags!
*/

const GameSEO = ({initialWidth, initialHeight}) => {
  // All of this useEffect/useState code is only for resizing the loading skeleton container properly.
  // So it simulates the real phaser game container when it resizes!
  const [newHeight, setNewHeight] = useState(initialHeight);
  const skeletonEl = useRef();

  useEffect(() => {
    const aspectRatio = initialWidth / initialHeight;

    const resizeSkeleton = () => {
      const currentWidth = skeletonEl.current.clientWidth;
      
      setNewHeight(currentWidth / aspectRatio);
    };

    window.addEventListener('resize', resizeSkeleton);

    resizeSkeleton();

    return () => {
      window.removeEventListener('resize', resizeSkeleton);
    };
  }, []);

  return (
    <>
      <Box mx="auto" className="phaser-container">
        <Paper elevation={3}>
          <Skeleton variant="rect" id="phaser-container" ref={skeletonEl}>
            <canvas width={initialWidth} height={initialHeight}>The CircleFight game</canvas>
          </Skeleton>
        </Paper>
      </Box>
      <style jsx global>{`
        .phaser-container {
          max-width: ${initialWidth}px;
        }
        #phaser-container {
          max-height: ${newHeight}px;
          overflow: hidden;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};


export default GameSEO;