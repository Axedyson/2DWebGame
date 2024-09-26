import { ServerStyleSheets } from '@material-ui/core/styles';
import Document, { Head, Html, Main, NextScript } from 'next/document';


class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// Here is the material-ui example that is implementing the code below:
// https://github.com/mui-org/material-ui/tree/master/examples/nextjs

// Make sure that the damn UNMINIFIED JSS (CSS) to be rendered on the server:
MyDocument.getInitialProps = async ctx => {
  // Resolution order

  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render

  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render

  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props => sheets.collect(<App {...props} />)
    });

  const initialProps = await Document.getInitialProps(ctx);
  
  return {
    ...initialProps,
    //Styles fragment is rendered after the app and page rendering finish.
    /*
    If you look at other examples of doing the same thing, then you'll see
    code like this: {initialProps.styles}{sheets.getStyleElement()} (they are switched)
    The reason why I have chosen to switch those, is so my own css have precedence over the
    material ui css code when rendered server side!
    */
    styles: <>{sheets.getStyleElement()}{initialProps.styles}</>
  };
};


export default MyDocument;

//The getInitialProps in the _document file should proably be renamed to renderDocument
