import Typography from '@material-ui/core/Typography';
import Head from 'next/head';

/* Have to include the 404 title myself instead of using a layout,
  maybe in the future I'll create a layout for the 404 page who knows :) */
const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 - CircleFight.com</title>
      </Head>
      <Typography variant="h4">404 - Page Not Found looooool</Typography>
    </>
  );
};

export default Custom404;
