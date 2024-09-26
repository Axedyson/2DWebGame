import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useContext } from 'react';
import * as Yup from 'yup';
import MainLayout, { RouteChangeContext } from '../components/MainLayout';
import styles from '../src/css/styles.module.css';
import Box from '@material-ui/core/Box';


const ResetPassword = () => {
  const navigate = useContext(RouteChangeContext);

  return (
    <Box mx="auto" className={styles.formContainer}>
      <Paper elevation={3}>
        <Box p={2}>
          <Typography variant="h4" gutterBottom align="center">Reset password</Typography>
          <Box mb={2.5}>
            <Typography variant="body1" align="center">
              Forgot your account’s password?
              Enter your email address and we’ll send you a recovery email to reset your password.
              Be sure to check your spam folders!
						</Typography>
          </Box>
          <Formik
            initialValues={{
              email: ''
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string().required('please provide an email').email('that is not an email').max(82)
            })}
            onSubmit={(values, { setSubmitting }) => {
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2));
                // You can delete this line if you are setting this onSubmit function as async. You probably will do it :)
                setSubmitting(false);
              }, 3000);
            }}
          >
            {({ isSubmitting }) => (
              <Form noValidate>
                <Grid container direction="column" spacing={3}>
                  <Grid item>
                    <Field fullWidth variant="outlined" component={TextField} name="email" type="email" label="Email" />
                  </Grid>
                  <Grid item>
                    <Button fullWidth type="submit" variant="contained" disabled={isSubmitting || navigate}>
                      Send recovery email{isSubmitting && <LinearProgress color="secondary" className={styles.lpBtn} />}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </Box>
  );
};

ResetPassword.getLayout = page => <MainLayout title="Reset Password">{page}</MainLayout>;

export default ResetPassword;
