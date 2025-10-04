import { type Config } from "prettier"

const config: Config = {
  plugins: ["prettier-plugin-tailwindcss"],
  useTabs: false,
  tabWidth: 2,
  trailingComma: "none",
  singleQuote: false,
  semi: false
}

export default config
