import { useRegisterSW } from "virtual:pwa-register/react";

const swUpdateIntervalMS = 60 * 60 * 1000; // 1 hour

export function useSWRegister() {
  useRegisterSW({
    immediate: true,
    onRegisteredSW(_, registration) {
      if (!registration) return;

      setInterval(() => {
        void registration.update();
      }, swUpdateIntervalMS);
    },
  });
}
