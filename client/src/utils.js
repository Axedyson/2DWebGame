import cookie from 'cookie';

// The reason for the use of "a" and "u" variable names are because they are used so often that I might as well make the 
// the variables short! to increase performance while I guess making it a bit more secure by using "cryptic" names!

// Use this function if your component is not rendered with the MainLayout or ONLY needs the access token for some reason
const fetchToken = async req => {
  const cookies = cookie.parse(req.headers.cookie ? req.headers.cookie : "");
  const props = {};
  
  if (cookies.r) {
    const res = await fetch(`${process.env.SDOMAIN}/refresh_token`, {
      method: 'POST',
      headers: {'Cookie': `r=${cookies.r}`}
    });
    if (res.ok) props.a = await res.json();
  }
  
  return props;
};

// Use this function if your component is rendered with the MainLayout component!
export const fetchLayoutData = async req => {
  const props = await fetchToken(req);
  
  if (props.a) {
    const res = await fetch(`${process.env.SDOMAIN}/profile_layout`, {
      headers: {'Authorization': `Bearer ${props.a}`}
    });
    if (res.ok) props.u = await res.json();
  }
  
  return props;
};

// Use this to redirect to the login page on protected pages if no access token could be retrieved!
// Sadly next.js doesn't really handle redirects very well, hopefully a solution will be developed in the future:
// https://github.com/vercel/next.js/discussions/11281
// It seems like it's hopefully on it's way to be fixed:
// https://github.com/vercel/next.js/discussions/14890
// Next.js introduced some new redirect mechanism but it doesn't solve it for me as i need it at
// runtime (running inside getServerSideProps function):
// https://nextjs.org/blog/next-9-5#redirects
export const redirect = (res) => {
  // Maybe I should use 401 http code instead:
  // https://stackoverflow.com/questions/2839585/what-is-correct-http-status-code-when-redirecting-to-a-login-page
  // https://www.illucit.com/asp-net/asp-net-5-identity-302-redirect-vs-401-unauthorized-for-api-ajax-requests/
  res.writeHead(302, { Location: '/login' });
  res.end();
};

// This function expects the accessToken to be truthy (not undefined or null!)
// In protected-only pages jsx files you don't need to see if the accessToken is valid because IT SHOULD BE!
export const fetcher = async (url, accessToken, logout, setNewFlashMessage) => {
  const res = await fetch(url, {headers: {'Authorization': `Bearer ${accessToken}`}});

  // If the response was okay (status in the range 200-299) then get the json data and return it!
  // Otherwise on 401 unauthorised error, 500 internal server errors, etc. logout!
  if (res.ok) {
    const json = await res.json();
    return json;
  } else {
    setNewFlashMessage("You've been logged out because you're unauthorized", "error");
    logout();
  }
};