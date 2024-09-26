import Typography from '@material-ui/core/Typography';
import dynamic from 'next/dynamic';
import GameSEO from '../components/game/GameSEO';
import MainLayout from '../components/MainLayout';
import { fetchLayoutData } from '../src/utils';

const GameCanvas = dynamic(() => import('../components/game/GameCanvas'), {ssr: false, loading: () =>
  <GameSEO {...{initialWidth: process.env.initialWidth, initialHeight: process.env.initialHeight}} />
});

const Index = () => {
  return (
    <>
      <Typography gutterBottom variant="h5" align="center">The game itself is down below</Typography>
      <GameCanvas {...{initialWidth: process.env.initialWidth, initialHeight: process.env.initialHeight}} />
    </>
  );
};

export const getServerSideProps = async ({req}) => {
  const props = await fetchLayoutData(req);
  return {props};
};


Index.getLayout = page => <MainLayout>{page}</MainLayout>;

export default Index;
