import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

// Create a theme instance.
const theme = responsiveFontSizes(createMuiTheme({
  palette: {
    primary: {
      light: "#7986cb",
      main: "rgba(0, 0, 0, 1)",
      dark: "#303f9f",
      contrastText: "rgba(255, 255, 255, 1)"
    },
    secondary: {
      main: "rgba(0, 230, 64, 1)"
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "rgba(0, 0, 0, 0.38)"
    }
  }
}));

export default theme;