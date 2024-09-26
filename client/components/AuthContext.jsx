import Router from 'next/router';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { FlashContext } from './FlashContext';

/*
Text taken from the whiteboard:

CSRF safe.
XSS safe.
Good performance.

To increase security: 
  1. Revoke refresh/access token at logout, not just remove it from the browser
  2. Put an expiration date on the refresh token, which means I also have to send back a refresh token cookie more often
*/

export const AuthContext = createContext();

// If there are any performance issues or you want to prevent a re render, read the following:
// I would personally go for using multiple contexts!
// https://github.com/facebook/react/issues/15156#issuecomment-474590693
// https://reactjs.org/docs/hooks-reference.html#usecontext
const AuthContextProvider = ({initialAToken, userData, children}) => {
  const [accessToken, setAccessToken] = useState(initialAToken);
  const {setNewFlashMessage, setShow} = useContext(FlashContext);
  const blockLogout = useRef(false);
  
  // Make sure that the state of the access token is equal to the new initial access token prop.
  // This happens whenever the user switches authenticated pages.
  useEffect(() => {
    if (initialAToken !== accessToken) setAccessToken(initialAToken);
  }, [initialAToken]);

  useEffect(() => {
    let timer;

    // If the access token is truthy (having a valid access token) then initialize the timer to retrieve a new one
    // If it's falsey then we want to expect that the user doesn't have a refresh token cookie or the user simply logged out
    // and then we shouldn't initialize the timer!
    if (accessToken) {
      timer = setTimeout(async () => {
        const res = await fetch('api/refresh_token', {method: 'POST'});

        if (res.ok) setAccessToken(await res.json());
        // Logout and redirect to the login page if there is no longer an access token avaliable!
        else {
          setNewFlashMessage("You've been logged out because you're unauthorized", "error");
          logout();
        }
      }, process.env.REFRESH_TIMEOUT);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [accessToken]);

  useEffect(() => {
    let logOutOnOtherTabs;

    // If there is no access token I will not be setting an event listener since that could mess with the
    // users non-logged in tab. Maybe he was doing something important on this non-logged in tab,
    // and judging from that, I will make sure nothing happens on that tab like redirecting or re rendering different new things!
    if (accessToken) {
      logOutOnOtherTabs = event => {
        // Since this event was fired I only need to redirect to the login page.
        // The access token will be removed at the login page since the page doesn't pass any access token to the auth context
        // I'm also checking if newValue is truthy so I only respond to localStorage events that don't remove anything!
        // Probably don't need it, but I'm doing it anyway just in case!
        if (event.key === "logout" && event.newValue) {
          // Hide the message on other tabs before showing a new one on the next route.
          // This makes sure that the new message gets it's updated values from localStorage!
          setShow(false);
          Router.push("/login");
        }
      };
  
      window.addEventListener('storage', logOutOnOtherTabs);
    }
    
    return () => {
      if (logOutOnOtherTabs) window.removeEventListener('storage', logOutOnOtherTabs);
    };
  }, [accessToken]);

  const logout = async () => {
    // If we haven't blocked the logout function then run the functionality inside the if statement otherwise don't
    if (!blockLogout.current) {
      // Block/prevent multiple useSWR hooks on a page from triggering multiple logouts!
      blockLogout.current = true;

      // Requesting the logout endpoint will clear the refresh token cookie we have stored
      const res = await fetch("api/logout");
      // Log out on other tabs!
      window.localStorage.setItem('logout', 'event');
      // Remove the local storage data, since I don't like storing unnecessary data on the user's browser (not leaving any traces)!
      window.localStorage.removeItem('logout');
      // And finally redirect from the current page to the login page
      // The access token will be removed at the login page since the page doesn't pass any access token to the auth context
      Router.push("/login");

      // Unblock the blocking xD after the /login redirect
      blockLogout.current = false;
    }
  };
  
  return (
    <AuthContext.Provider value={{accessToken, userData, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;