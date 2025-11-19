import type { User } from "../../generated/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
