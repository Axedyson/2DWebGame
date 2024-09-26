import FormHelperText from '@material-ui/core/FormHelperText';
import { CheckboxWithLabel } from 'formik-material-ui';
import Box from '@material-ui/core/Box';


const CheckBoxWithErrorField = (props) => {
  const { form: { touched: { consent: consentTouched }, errors: { consent: consentError } } } = props;

  return (
    <>
      <CheckboxWithLabel {...props} />
      {consentTouched && consentError && <Box ml={4}><FormHelperText error>{consentError}</FormHelperText></Box>}
    </>
  );
};

export default CheckBoxWithErrorField;