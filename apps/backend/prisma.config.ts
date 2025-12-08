import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.resolve("prisma", "schema.prisma"),
  migrations: {
    path: path.resolve("prisma", "migrations"),
  },
  views: {
    path: path.resolve("prisma", "views"),
  },
  typedSql: {
    path: path.resolve("prisma", "queries"),
  },
  datasource: {
    // Can't use env() due to https://github.com/prisma/prisma/issues/28590
    url: process.env.DATABASE_URL!,
  },
});
