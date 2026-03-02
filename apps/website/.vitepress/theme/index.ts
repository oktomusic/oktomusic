import { h } from "vue";
import Theme from "vitepress/theme";
import "virtual:group-icons.css";

import RegisterSW from "./components/RegisterSW.vue";

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      "layout-bottom": () => h(RegisterSW),
    });
  },
};
