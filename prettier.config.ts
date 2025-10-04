import { type Config } from "prettier"

const config: Config = {
  plugins: ["prettier-plugin-tailwindcss"],
  useTabs: false,
  tabWidth: 2,
  trailingComma: "all",
  singleQuote: false,
  semi: false,
}

export default config
