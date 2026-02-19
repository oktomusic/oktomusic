import { VibrantColors } from "../atoms/player/machine";

export default function applyColorProperties(
  elem: HTMLElement,
  colors: VibrantColors | null,
) {
  elem.style.setProperty("--album-color-vibrant", colors?.vibrant || null);
  elem.style.setProperty(
    "--album-color-vibrant-dark",
    colors?.darkVibrant || null,
  );
  elem.style.setProperty(
    "--album-color-vibrant-light",
    colors?.lightVibrant || null,
  );
  elem.style.setProperty("--album-color-muted", colors?.muted || null);
  elem.style.setProperty("--album-color-muted-dark", colors?.darkMuted || null);
  elem.style.setProperty(
    "--album-color-muted-light",
    colors?.lightMuted || null,
  );
}
