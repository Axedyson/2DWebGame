import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { useRouter } from 'next/router';
import { createContext, useEffect, useRef, useState } from 'react';

export const FlashContext = createContext();

const FlashContextProvider = ({children}) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const snack = useRef({});

  const handleClose = (e, reason) => {
    // The message won't go away if the user just clicks outside of the snackbar.
    // This is more robust and makes sure that the message appears on a redirect. It wouldn't
    // always do that sometimes :(
    if (reason !== "clickaway") setShow(false);
  };
  
  useEffect(() => {
    // The message will be removed even if the user didn't see the message in the first place like closing down the website
    // Why is it done this way? It's done this way so the user doesn't find unnecessary old confusing messages when 
    // the user visits the website later after the user closed it right before a redirect (yeah I know it's a weird user,
    // but I want to handle such an edge case)
    const JSONMsg = window.localStorage.getItem('msg');
    const msg = JSONMsg && JSON.parse(JSONMsg);
    if (msg) {
      snack.current.severity = msg.severity;
      snack.current.text = msg.text;
      setShow(true);
      window.localStorage.removeItem('msg');
    // Remove previous messages from the DOM! This makes sure that when the user swtiches pages
    // the old message on the specific page that the user switched pages from gets hidden!!
    } else if (show) setShow(false);
  }, [router.pathname]);
  
  // This function only takes affect when the user has been redirected or gone to a different page!
  const setNewFlashMessage = (text, severity) => {
    window.localStorage.setItem('msg', JSON.stringify({text, severity}));
    // Hide the message before showing a new one on the next route.
    // This makes sure that the new message gets it's updated values from localStorage!
    setShow(false);
  };

  return (
    // Passing down the setShow() setState function to AuthContext 
    // so other tabs can remove snackbars before they will redirect to the login page
    <FlashContext.Provider value={{setNewFlashMessage, setShow}}>
      {children}
      <Snackbar open={show} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center'}} autoHideDuration={6000}
        TransitionComponent={Slide}
      >
        <Alert onClose={handleClose} severity={snack.current.severity} elevation={6} variant="filled">{snack.current.text}</Alert>
      </Snackbar>
    </FlashContext.Provider>
  );
};

export default FlashContextProvider;