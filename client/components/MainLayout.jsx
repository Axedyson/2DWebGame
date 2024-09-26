import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import MuiLink from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import Head from 'next/head';
import NextLink from 'next/link';
import Router from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import styles from '../src/css/styles.module.css';
import { fetcher } from '../src/utils';
import { AuthContext } from './AuthContext';
import { FlashContext } from './FlashContext';
import Box from '@material-ui/core/Box';

export const RouteChangeContext = createContext();

const MainLayout = ({ children, title }) => {
  const [open, setOpen] = useState(false);
  const [navigate, setNavigate] = useState(false);
  
  const {setNewFlashMessage} = useContext(FlashContext);
  const {accessToken, userData, logout} = useContext(AuthContext);
  const { data: userInfo } = useSWR(accessToken ? ['api/profile_layout', accessToken, logout, setNewFlashMessage] : null, 
    fetcher, {initialData: userData});

  useEffect(() => {
    const handleRouteChange = () => {
      setNavigate(true);
    };

    const handleRouteChangeComplete = () => {
      setNavigate(false);
      setOpen(false);
    };

    Router.events.on('routeChangeStart', handleRouteChange);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);
    Router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChange);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
      Router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Head>
        <title>{title && `${title} - `}CircleFight.com</title>
      </Head>
      {navigate && <LinearProgress color="secondary" className="lp" />}
      <AppBar>
        <Toolbar>
          <Box display={{ xs: 'block', sm: 'none' }}>
            <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={handleDrawerOpen}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Box mx={{ xs: 'auto', sm: 0 }}>
            <NextLink href="/" passHref>
              <MuiLink color="inherit" variant="h4" underline="none">CircleFight</MuiLink>
            </NextLink>
          </Box>
          <Box ml="auto" display={{ xs: 'none', sm: 'block' }}>
            {userInfo ?
              <NextLink href="/account" passHref>
                <Button variant="contained" color="secondary">account</Button>
              </NextLink>
              :
              <NextLink href="/login" passHref>
                <Button variant="contained" color="secondary">login</Button>
              </NextLink>
            }
          </Box>
          <Box ml={1} display={{ xs: 'none', sm: 'block' }}>
            {userInfo ?
              <Button variant="contained" color="secondary" onClick={() => {
                setNewFlashMessage("You've been logged out successfully", "success");
                logout();
              }}>logout</Button>
              :
              <NextLink href="/signup" passHref>
                <Button variant="contained" color="secondary">sign up</Button>
              </NextLink>
            }
          </Box>
          {userInfo && 
            <Box ml={1} display={{ xs: 'none', sm: 'block' }}>
              <Avatar alt={userInfo.username} src={userInfo.image} className={styles.pfp} />
            </Box>
          }
        </Toolbar>
      </AppBar>
      <RouteChangeContext.Provider value={navigate}>
        <Box pt={12} pb={2}>
          <Container maxWidth={false}>
            {children}
          </Container>
        </Box>
      </RouteChangeContext.Provider>
      <Drawer anchor="left" variant="temporary" open={open} onClose={handleDrawerClose}>
        <Box display="flex" justifyContent="flex-end" p={1}>
          <IconButton aria-label="close drawer" onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List component="nav">
          <NextLink href="/" passHref>
            <ListItem button component="a">
              <ListItemText primary="Home" />
            </ListItem>
          </NextLink>
          <NextLink href="/signup" passHref>
            <ListItem button component="a">
              <ListItemText primary="Sign Up" />
            </ListItem>
          </NextLink>
          <NextLink href="/login" passHref>
            <ListItem button component="a">
              <ListItemText primary="Login" />
            </ListItem>
          </NextLink>
        </List>
      </Drawer>
      <style jsx global>{`
        .MuiDrawer-paper {
          max-width: 320px;
          width: 100%;
        }
        .lp {
          background-color: #fafafa;
          z-index: 1301;
          height: 2px;
          position: fixed;
          right: 0;
          left: 0;
        }
      `}</style>
    </>
  );
};


export default MainLayout;