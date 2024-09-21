// Save this as auth.js
const auth0 = {
  domain: 'dev-qc3k5uu3lnr7sk2j.us.auth0.com',
  clientId: '1aUv1ehyG6c13dj1J5JV2BC9KciEd5zL',
  redirectUri: 'http://localhost:8000/redirectHere',
  audience: 'https://dev-qc3k5uu3lnr7sk2j.us.auth0.com/api/v2/',
  scope: 'openid profile email'
};

function authenticate() {
  const authUrl = new URL(`https://${auth0.domain}/authorize`);
  authUrl.searchParams.append('client_id', auth0.clientId);
  authUrl.searchParams.append('response_type', 'token id_token');
  authUrl.searchParams.append('redirect_uri', auth0.redirectUri);
  authUrl.searchParams.append('audience', auth0.audience);
  authUrl.searchParams.append('scope', auth0.scope);

  chrome.identity.launchWebAuthFlow(
    { url: authUrl.toString(), interactive: true },
    function(redirectUrl) {
      if (chrome.runtime.lastError || !redirectUrl) {
        console.error('Auth error', chrome.runtime.lastError);
        return;
      }
      // Handle the auth response
      handleAuthResponse(redirectUrl);
    }
  );
}

function handleAuthResponse(redirectUrl) {
  const url = new URL(redirectUrl);
  const params = new URLSearchParams(url.hash.slice(1));
  const accessToken = params.get('access_token');
  const idToken = params.get('id_token');

  if (accessToken && idToken) {
    // Store tokens securely
    chrome.storage.local.set({ accessToken, idToken }, function() {
      console.log('Tokens stored');
    });
  } else {
    console.error('Authentication failed');
  }
}