# BullMQ with valkey-glide-ioredis-adapter Example

This example demonstrates the authentication issue when using `valkey-glide-ioredis-adapter` with BullMQ.

## Problem

The `valkey-glide-ioredis-adapter` v0.4.0 has a bug where duplicated connections (created by BullMQ for blocking operations) don't inherit authentication credentials, causing "NOAUTH Authentication required" errors.

## Prerequisites

1. Valkey/Redis running on localhost:6379 with password authentication:
   ```bash
   docker run -d --name valkey -p 6379:6379 valkey/valkey:9-alpine \
     valkey-server --requirepass oktomusic
   ```

## Run

```bash
npm install
npm start
```

## Expected Output

You will see "NOAUTH Authentication required" errors in the logs because BullMQ's Worker calls `duplicate()` on the connection, and the duplicated connection doesn't have the password configured properly.

## Root Cause

In the adapter's code, the `duplicate()` method creates a new instance:
```javascript
async duplicate(override) {
  const newOptions = { ...this.options, ...override };
  const newAdapter = new ModularRedisAdapter(newOptions);
  return newAdapter;
}
```

While the password is passed in options, the underlying GLIDE client connection setup doesn't properly authenticate when these duplicated instances connect.
