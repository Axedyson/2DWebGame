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
import CheckBoxWithErrorField from '../components/form/CheckBoxWithErrorField';
import HCaptchaField from '../components/form/HCaptchaField';
import ImageFileField from '../components/form/ImageFileField';
import MainLayout, { RouteChangeContext } from '../components/MainLayout';
import styles from '../src/css/styles.module.css';
import Box from '@material-ui/core/Box';


const SignUp = () => {
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
            <Typography variant="h4" gutterBottom align="center">Sign Up</Typography>
            <Formik
              initialValues={{
                username: '',
                email: '',
                password: '',
                image: null,
                cropData: null,
                consent: false,
                remember: false,
                captcha: ''
              }}
              validationSchema={Yup.object().shape({
                username: Yup.string().trim().required('please provide a username').min(3).max(20),
                email: Yup.string().required('please provide an email').email('that is not an email').max(82),
                password: Yup.string().required('please provide a password').min(5).max(30),
                image: Yup.mixed().test('fileSize', 'File too large', file => file ? file.size <= process.env.FILE_SIZE : true)
                  .test('fileFormat', 'Unsupported Format', file => file ? process.env.SUPPORTED_FORMATS.includes(file.type) : true),
                consent: Yup.bool().oneOf([true], 'Sorry, but you have to agree to our policies'),
                captcha: Yup.string().required("Please pass the hCaptcha test")
              })}
              onSubmit={async (values) => {
                const formData = new FormData();
                formData.append('username', values.username);
                formData.append('image', values.image);
                if (values.cropData) {
                  formData.append('width', values.cropData.width);
                  formData.append('height', values.cropData.height);
                  formData.append('x', values.cropData.x);
                  formData.append('y', values.cropData.y);
                }
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('consent', values.consent);
                formData.append('remember', values.remember);
                formData.append('captcha', values.captcha);
                const res = await fetch('api/signup', {
                  method: 'POST',
                  headers: {'Accept': 'application/json'},
                  body: formData
                });
                const data = await res.json();
                if (data.errors) {
                  errorMessage.current = data.errors.msg;
                  toggleError(true);
                } else {
                  setNewFlashMessage("You're account has been successfully created!", "success");
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
                    <Grid container item direction="column" alignItems="center" spacing={1}>
                      <Field component={ImageFileField} />
                    </Grid>
                    <Grid item>
                      <Field fullWidth variant="outlined" component={TextField} name="email" type="email" label="Email" />
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
                      <Field component={CheckBoxWithErrorField} type="checkbox" name="consent"
                      Label={{ label: 'I have read and agree to the Cookies Policy, Privacy Policy, and Terms Of Use' }} />
                    </Grid>
                    <Grid item>
                      <Button fullWidth type="submit" variant="contained" disabled={isSubmitting || navigate}>
                        Sign up{isSubmitting && <LinearProgress color="secondary" className={styles.lpBtn} />}
                      </Button>
                      <Box mt={1.5}>
                        <NextLink href="/login" passHref>
                          <MuiLink>Already have an account? Login</MuiLink>
                        </NextLink>
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

SignUp.getLayout = page => <MainLayout title="Sign Up">{page}</MainLayout>;

export default SignUp;