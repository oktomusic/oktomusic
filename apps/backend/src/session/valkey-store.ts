/* eslint-disable @typescript-eslint/no-misused-promises */
import { type SessionData, Store } from "express-session";
import {
  GlideClient,
  GlideClusterClient,
  TimeUnit,
} from "@valkey/valkey-glide";

interface Serializer {
  parse(s: string): SessionData | Promise<SessionData>;
  stringify(s: SessionData): string;
}

function optionalCb<T>(
  err: T | null,
  result?: unknown,
  cb?: (err: T | null, result?: unknown) => void,
) {
  if (cb) {
    return cb(err, result);
  }
}

export class ValkeyStore extends Store {
  constructor(
    private glideClient: GlideClient | GlideClusterClient,
    private serializer: Serializer = JSON,
    private prefix: string = "sess:",
    private defaultTtl: number = 86400, // 1 day
  ) {
    super();
  }

  public async get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void,
  ) {
    const key = this.prefix + sid;
    try {
      const data = await this.glideClient.get(key);
      if (!data) return callback(null, null);
      return callback(null, await this.serializer.parse(data.toString()));
    } catch (err) {
      return callback(err, null);
    }
  }

  public async set(
    sid: string,
    session: SessionData,
    callback?: (err?: unknown) => void,
  ) {
    const key = this.prefix + sid;
    const ttl = this.getTTL(session);

    try {
      if (ttl > 0) {
        const val = this.serializer.stringify(session);

        await this.glideClient.set(key, val, {
          expiry: { type: TimeUnit.Seconds, count: ttl },
        });

        return optionalCb(null, null, callback);
      }
      return this.destroy(sid, callback);
    } catch (err) {
      return optionalCb(err, null, callback);
    }
  }

  public async destroy(sid: string, callback?: (err?: unknown) => void) {
    const key = this.prefix + sid;
    try {
      await this.glideClient.del([key]);
      return optionalCb(null, null, callback);
    } catch (err) {
      return optionalCb(err, null, callback);
    }
  }

  public async touch(sid: string, session: SessionData, callback?: () => void) {
    const key = this.prefix + sid;
    try {
      await this.glideClient.expire(key, this.getTTL(session));
      return optionalCb(null, null, callback);
    } catch (err) {
      return optionalCb(err, null, callback);
    }
  }

  private getTTL(sess: SessionData): number {
    let ttl;
    if (sess?.cookie?.expires) {
      const ms = Number(new Date(sess.cookie.expires)) - Date.now();
      ttl = Math.ceil(ms / 1000);
    } else {
      ttl = this.defaultTtl;
    }
    return ttl;
  }
}
