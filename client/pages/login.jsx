import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import MuiLink from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import NextLink from 'next/link';
import Router from 'next/router';
import { useContext, useRef, useState } from 'react';
import * as Yup from 'yup';
import { FlashContext } from '../components/FlashContext';
import HCaptchaField from '../components/form/HCaptchaField';
import MainLayout, { RouteChangeContext } from '../components/MainLayout';
import styles from '../src/css/styles.module.css';
import Box from '@material-ui/core/Box';


const Login = () => {
  const navigate = useContext(RouteChangeContext);
  const {setNewFlashMessage} = useContext(FlashContext);
  const [showError, toggleError] = useState(false);
  const errorMessage = useRef();

  const handleClose = () => {
    toggleError(false);
  };

  // The reason why I have <Grid item xs> for the HCaptchaField is hard to explain :/
  // If you want the explanation do the following: remove the "xs" and then resize the whole form down a lot and see what
  // happens to the other form elements (they are sticking out of the paper/form container :/ )
  return (
    <>
      <Box mx="auto" className={styles.formContainer}>
        <Paper elevation={3}>
          <Box p={2}>
            <Typography variant="h4" gutterBottom align="center">Login</Typography>
            <Formik
              initialValues={{
                username: '',
                password: '',
                remember: false,
                captcha: ''
              }}
              validationSchema={Yup.object().shape({
                username: Yup.string().trim().required('please provide a username').min(3).max(20),
                password: Yup.string().required('please provide a password').min(5).max(30),
                captcha: Yup.string().required("Please pass the hCaptcha test")
              })}
              onSubmit={async (values) => {
                const res = await fetch('api/login', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                  body: JSON.stringify(values)
                });
                const data = await res.json();
                if (data.errors) {
                  errorMessage.current = data.errors.msg;
                  toggleError(true);
                } else {
                  setNewFlashMessage("You've have been logged in!", "success");
                  Router.push("/");
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form noValidate>
                  <Grid container direction="column" spacing={3}>
                    <Grid item>
                      <Field fullWidth variant="outlined" component={TextField} name="username" label="Username" />
                    </Grid>
                    <Grid item>
                      <Field fullWidth variant="outlined" component={TextField} name="password" type="password" label="Password" />
                    </Grid>
                    <Grid item xs>
                      <Field reset={showError} component={HCaptchaField} />
                    </Grid>
                    <Grid item>
                      <Field component={CheckboxWithLabel} type="checkbox" name="remember" Label={{ label: 'Remember me' }} />
                    </Grid>
                    <Grid item>
                      <Button fullWidth type="submit" variant="contained" disabled={isSubmitting || navigate}>
                        Login
                        {isSubmitting && <LinearProgress color="secondary" className={styles.lpBtn} />}
                      </Button>
                      <Box mt={1.5}>
                        <Grid container justify="space-between" spacing={1}>
                          <Grid item xs={12} sm="auto">
                            <NextLink href="/reset_password" passHref>
                              <MuiLink>Forgot password?</MuiLink>
                            </NextLink>
                          </Grid>
                          <Grid item xs={12} sm="auto">
                            <NextLink href="/signup" passHref>
                              <MuiLink>Don't have an account? Sign Up</MuiLink>
                            </NextLink>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Box>
        </Paper>
      </Box>
      <Snackbar open={showError} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" elevation={6} variant="filled">{errorMessage.current}</Alert>
      </Snackbar>
    </>
  );
};

Login.getLayout = page => <MainLayout title="Login">{page}</MainLayout>;

export default Login;