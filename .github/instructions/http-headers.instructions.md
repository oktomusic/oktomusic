---
applyTo: "app/website/docs/public/_headers,app/website/Caddyfile"
description: "Instructions for setting up HTTP headers for security and performance."
---

The configuration should be as hardened as possible while still allowing the application to function correctly.

The goal is to have the highest scores on the HTTP Observatory https://developer.mozilla.org/en-US/observatory and Security Headers https://securityheaders.com tests.

The official instance hosted at Cloudflare (`_headers`) and the Docker image with Caddy (`Caddyfile`) contains the headers applied. These should always match.
