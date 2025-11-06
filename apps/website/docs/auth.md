# Authentication

https://openid.net/developers/how-connect-works

Oktomusic is a OpenID Connect RP (Relying Party). It's designed to delegates user authentication to an external OpenID Connect OP (OpenID Provider) such as Keycloak.

Authorization Code Flow with PKCE and server-side sessions.

It will rely on the following protocols:

- OpenID Connect Core
- OpenID Connect Discovery

In the future, it may support additional protocols such as:

- OpenID Connect Dynamic Client Registration
- OpenID Connect Session Management
