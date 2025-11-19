# BullMQ Authentication Examples

This repository contains two minimal reproducible examples demonstrating the authentication issue with `valkey-glide-ioredis-adapter` when used with BullMQ.

## Structure

```
bullmq-auth-examples/
├── with-glide-adapter/       # Example showing the authentication bug
│   ├── package.json
│   ├── index.js
│   └── README.md
└── without-adapter/           # Example showing the working solution with iovalkey
    ├── package.json
    ├── index.js
    └── README.md
```

## Problem Summary

The `valkey-glide-ioredis-adapter` v0.4.0 has a critical bug when used with BullMQ:
- BullMQ creates duplicate connections for blocking operations (e.g., Worker instances)
- The adapter's `duplicate()` method doesn't properly pass authentication credentials to these new connections
- This causes continuous "NOAUTH Authentication required" errors

## Setup

### Start Valkey with Authentication

```bash
docker run -d --name valkey -p 6379:6379 valkey/valkey:9-alpine \
  valkey-server --requirepass oktomusic
```

### Run the Examples

**With glide adapter (shows the bug):**
```bash
cd with-glide-adapter
npm install
npm start
```

Expected: You'll see "NOAUTH Authentication required" errors

**Without adapter (shows the fix):**
```bash
cd without-adapter
npm install
npm start
```

Expected: Clean execution with no errors

## Technical Details

### The Bug in valkey-glide-ioredis-adapter

The adapter's `duplicate()` method:
```javascript
async duplicate(override) {
  const newOptions = { ...this.options, ...override };
  const newAdapter = new ModularRedisAdapter(newOptions);
  return newAdapter;
}
```

While it copies options, the underlying GLIDE client connection initialization doesn't properly authenticate the duplicated connections.

### How iovalkey Handles It Correctly

iovalkey (a fork of ioredis by the Valkey team) properly implements `duplicate()`:
```javascript
duplicate(override) {
  const options = Object.assign({}, this.options, override);
  return new Valkey(options);
}
```

The new instance properly connects with authentication because iovalkey's constructor correctly processes the password option.

## Recommendations

1. **Use `iovalkey`** - It's the official Valkey Node.js client
2. **Wait for adapter fix** - File an issue with valkey-glide-ioredis-adapter maintainers
3. **Use ioredis temporarily** - If you must use ioredis-compatible adapter, use the original ioredis until the glide adapter is fixed

## Why iovalkey?

- Official Valkey client maintained by the Valkey team
- Direct fork of ioredis with Valkey-specific improvements
- Better long-term support for Valkey features
- Proven compatibility with BullMQ

## Comparison

| Feature | valkey-glide-ioredis-adapter | iovalkey |
|---------|------------------------------|----------|
| BullMQ Authentication | ❌ Broken | ✅ Works |
| Valkey GLIDE Backend | ✅ Yes | ❌ No (uses native protocol) |
| Official Support | Community | Valkey Team |
| Connection Pooling | Via GLIDE | Native |
| Performance | High (Rust core) | High (Node.js) |

## Conclusion

While `valkey-glide-ioredis-adapter` promises better performance through GLIDE's Rust core, it currently has critical bugs that prevent it from working with BullMQ when authentication is required. 

The recommended solution is to use `iovalkey`, which is officially maintained by the Valkey team and proven to work correctly with BullMQ.
