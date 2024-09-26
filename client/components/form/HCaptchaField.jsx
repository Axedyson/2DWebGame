import HCaptcha from '@hcaptcha/react-hcaptcha';
import FormHelperText from '@material-ui/core/FormHelperText';
import { useEffect, useRef, useState } from 'react';


// I could've used the setFieldError formik function, but I came to the conclusion that it didn't work quite well
// with what I wanted to implement :/
// To use the reset boolean variable correctly make sure that the parent component sets the reset variable back to false
// again later to be able to run the useEffect function again later if necessary by setting the reset variable to true again!
const HCaptchaField = ({reset, form: { setFieldValue, setFieldTouched, touched: { captcha: touched }, errors: { captcha: HCaptchaError } } }) => {
  const [internalError, setInternalError] = useState();
  const hCaptchaEl = useRef();
  
  useEffect(() => {
    if (reset) {
      // Untouch the field so we don't trigger the "Please pass..." error by accident when we edit other fields!
      // Passing false as third argument to prevent unnecessary validation to run
      setFieldTouched("captcha", false, false);
      // Passing false as third argument to prevent validation to run because I think it's bad UX in this particular situation
      setFieldValue("captcha", "", false);
      hCaptchaEl.current.resetCaptcha();
    }
  }, [reset]);

  const handleChange = token => {
    // Set it to touched here so old internal errors gets removed
    // Passing false as third argument to prevent unnecessary validation to run
    setFieldTouched("captcha", true, false);
    // I'm not passing false here as a third argument since it is supposed to validate the input
    // and remove old "please pass..." errors
    setFieldValue("captcha", token);
  };

  const handleError = () => {
    // Make sure that we can show the internal error by untouching the field!
    // Passing false as third argument to prevent unnecessary validation to run
    setFieldTouched("captcha", false, false);
    // Passing false as third argument to prevent unnecessary validation to run
    setFieldValue("captcha", "", false);
    setInternalError("An error occurred with the hCaptcha");
  };

  const handleExpirationError = () => {
    // Make sure that we can show the internal error by untouching the field!
    // Passing false as third argument to prevent unnecessary validation to run
    setFieldTouched("captcha", false, false);
    // Passing false as third argument to prevent unnecessary validation to run
    setFieldValue("captcha", "", false);
    setInternalError("The hCaptcha session expired please reverify");
  };
  
  return (
    <>
      <HCaptcha theme="dark" sitekey={process.env.HCAPTCHA_SITEKEY} id="ssr-client-match"
        onVerify={handleChange}
        onError={handleError}
        onExpire={handleExpirationError}
        ref={hCaptchaEl}
      />
      {touched && HCaptchaError && <FormHelperText error>{HCaptchaError}</FormHelperText>}
      {!touched && internalError && <FormHelperText error>{internalError}</FormHelperText>}
    </>
  );
};

export default HCaptchaField;