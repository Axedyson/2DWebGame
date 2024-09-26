import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { useContext } from 'react';
import useSWR from 'swr';
import { AuthContext } from '../components/AuthContext';
import { FlashContext } from '../components/FlashContext';
import MainLayout from '../components/MainLayout';
import { fetcher, fetchLayoutData, redirect } from '../src/utils';
import Box from '@material-ui/core/Box';


const Account = ({userData}) => {
  const {accessToken, logout} = useContext(AuthContext);
  const {setNewFlashMessage} = useContext(FlashContext);
  const { data: accountDetails } = useSWR(['api/account', accessToken, logout, setNewFlashMessage], fetcher, {initialData: userData});

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h5" align="center">Account Details:</Typography>
        {accountDetails &&
          <>
            <Typography variant="subtitle1" align="center">email: {accountDetails.email}</Typography>
            <Typography variant="subtitle1" align="center">username: {accountDetails.username}</Typography>
            <Typography variant="subtitle1" align="center">image: {accountDetails.image}</Typography>
            <Typography variant="subtitle1" align="center">
            Amount of times you have revoked all your sessions: {accountDetails.sessionLogoutTimes}
            </Typography>
          </>
        }
      </Box>
    </Paper>
  );
};

export const getServerSideProps = async ({req, res}) => {
  const props = await fetchLayoutData(req);
  if (!props.a) redirect(res);
  else {
    const response = await fetch(`${process.env.SDOMAIN}/account`, {
      headers: {'Authorization': `Bearer ${props.a}`}
    });
    if (response.ok) props.userData = await response.json();
    else redirect(res);
  }

  return {props};
};


Account.getLayout = page => <MainLayout>{page}</MainLayout>;

export default Account;