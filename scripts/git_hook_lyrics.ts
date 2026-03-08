/**
 * Git hook script to check for missing translations in the frontend locales before committing.
 *
 * It reads the `messages.po` files from each locale directory and stores their content.
 *
 * Then it runs the extract script to update the po files, if any changes are detected, it will prevent the commit and ask the user to review the changes.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";

const scriptCommand = "pnpm run --filter @oktomusic/frontend po:extract";

// Locate the frontend locales directory

const localeBasePath = path.resolve(
  import.meta.dirname,
  "../apps/frontend/src/locales",
);

if (
  !fs.existsSync(localeBasePath) ||
  !fs.statSync(localeBasePath).isDirectory()
) {
  console.error("Locale directory not found:", localeBasePath);
  process.exit(1);
}

function readLocalesContent(): Readonly<Record<string, string>> {
  const localesContent: Record<string, string> = {};

  for (const dirent of fs.readdirSync(localeBasePath, {
    withFileTypes: true,
  })) {
    if (dirent.isDirectory()) {
      localesContent[dirent.name] = fs.readFileSync(
        path.resolve(localeBasePath, dirent.name, "messages.po"),
        "utf-8",
      );
    }
  }
  return localesContent;
}

// Collect all messages.po content before running the extraction script

const before = readLocalesContent();

// Run the extraction script to update the po files

try {
  execSync(scriptCommand, {
    stdio: "ignore",
  });
} catch (err) {
  console.error("Failed to run command");
  process.exit(1);
}

// Check for changes in the messages.po files

const after = readLocalesContent();

const changedLocales: string[] = [];

for (const locale of Object.keys(after)) {
  if (before[locale] !== after[locale]) {
    changedLocales.push(locale);
  }
}

if (changedLocales.length > 0) {
  console.error(
    "Translation files changed after extraction. You probably forgot to run the extract step.",
  );

  console.error("Changed locales:");
  for (const locale of changedLocales) {
    console.error("  -", locale);
  }
  console.error("Review and stage the updated files.\n");

  process.exit(1);
}

console.log("Translation files are up to date.");
process.exit(0);
