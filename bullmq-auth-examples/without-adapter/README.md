# BullMQ with iovalkey Example

This example demonstrates BullMQ working correctly with `iovalkey` (the official Valkey Node.js client, which is a fork of ioredis).

## Why This Works

`iovalkey` is a direct fork of `ioredis` maintained by the Valkey team. It properly implements the `duplicate()` method that BullMQ relies on, ensuring authentication credentials are correctly passed to duplicated connections.

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

You will see clean output with no authentication errors. The job will be processed successfully.

## Why iovalkey Instead of ioredis?

- `iovalkey` is the official Valkey client, maintained by the Valkey team
- It's a fork of `ioredis` specifically for Valkey
- Provides better compatibility with Valkey-specific features
- Direct support from the Valkey community

## How duplicate() Works in iovalkey

When BullMQ calls `duplicate()`, iovalkey creates a new connection instance that inherits all connection options including authentication:

```javascript
duplicate(override) {
  const options = Object.assign({}, this.options, override);
  return new Valkey(options);
}
```

This ensures that the password and other authentication details are properly passed to the new connection.
