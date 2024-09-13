const invalidRedirectException = `
If the issue describes or mentions:

- unable to logout while using cookies and loging in on multiple apps.
- unable to logout from second app.
- app 1 logs out but app 2 does not log out.
- InvalidRedirectException error or exception.

This exception is thrown when Amplify is unable to match the provided 'redirectSignOuts' from the Amplify configuration with the current window url.

The solution for this issue is to override the redirectSignOut URI via the signOut API. e.g

'''ts
import { signOut } from 'aws-amplify/auth';

signOut({ 
 global: false,
 oauth: {
    redirect: 'https://app2.example.com/signout',
  },
 });

'''
`

const unableToLogoutFromSocialProvider = `
If the issue describes or mentions:
- Ability to use https redirectSignOutUrls when using amplify v6.
- Unable to logout from social or upstream provider.
- InvalidRedirectException when using React Native and providing a redirectSignOut that starts with https.

This is issue is most likely due to:

When a user signs in with third-party identity providers (IdPs), there's an extra step to perform. If a user signs in using one of the third-party IdPs, then visiting the logout endpoint clears the "cognito" cookie from the browser. However, the IdP can still have an active session. Consider the following information when you're clearing out the user's IdP session:

- Amazon Cognito supports the single logout (SLO) feature for Security Assertion Markup Language version 2.0 (SAML 2.0) IdPs with HTTP POST Binding. If your provider accepts HTTP POST Binding on its SLO endpoint, then consider implementing SLO for SAML IdPs. If a user visits the logout endpoint with SLO turned on, then Amazon Cognito sends a signed logout request to the SAML IdP. Then, the SAML IdP clears the IdP session.
- For social and OpenID Connect (OIDC) IdPs, you must create a custom workflow to clear the IdP session from the browser.

The solution for this issue is to upgrade to the latest version of the library and to override the redirectSignOut URI via the signOut API and redirect the user to the upstream provider logout endpoint.
Note: This solution is applicable if the redirect signou you are trying to override is configured in the Cognito console.

'''ts
import { signOut } from 'aws-amplify/auth';

signOut({ 
 global: false,
 oauth: {
    redirect: 'https://authProvider/logout?logout_uri=https://mywebsite.com/',
  },
 });

'''
`
const unexpectedSignInInterruption = `
If the issue describes or mentions:
- User is not able to login after calling "signIn" and "confirmSignIn" successfully.
- Unable to store user's session in cookies after call  "signIn" and "confirmSignIn"
- UnexpectedSignInInterruption error or exception.
- UnexpectedSignInInterruption error or exception after successfully loging in.

This exception is thrown when the user's cookies are rejected by the browser. This can be due to:
- an invalid domain. For instance, the domain in the Cookies configuration is 'https://example.com', but the user logged in on 'http://localhost:3000/'.
- the secure flag in the Cookies configuration is set to 'true', but the user is on 'http://localhost:3000/'. — By default, Amplify will set this flag to true.


- Solution to override the secure flag on local development:

"""ts

import React from "react";
import { Amplify } from "aws-amplify";
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import amplify-outputs from './amplify-outputs.json';


  Amplify.configure(config); // or  Amplify.configure(config, { ssr: true }) if you are using SSR

  cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage(
   secure: !isLocalDevelopment() // If it is local development then the secure flag should be false, otherwise true.
  ));

"""

- Solution to configure the Cookies' domain:

"""ts

import React from "react";
import { Amplify } from "aws-amplify";
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import amplify-outputs from './amplify-outputs.json';


  Amplify.configure(config); // or  Amplify.configure(config, { ssr: true }) if you are using SSR

  cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage(
   domain: process.env.LOCAL ? 'localhost:3000' : 'https://production-domain.com'
  ));

"""
`
export const v6Issues = [
  unableToLogoutFromSocialProvider,
  unexpectedSignInInterruption,
  invalidRedirectException
];