import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createStore, Provider } from "jotai";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  batteryChargingAtom,
  batteryPercentageAtom,
} from "../atoms/app/battery.ts";
import { batterySupportAtom } from "../atoms/app/browser_support.ts";
import { settingClientBatteryIndicator } from "../atoms/app/settings_client.ts";
import { useBatteryStatus } from "./battery_status.ts";

class MockBatteryManager extends EventTarget implements BatteryManager {
  level = 0.626;
  charging = false;
}

function TestComponent() {
  useBatteryStatus();
  return null;
}

describe("useBatteryStatus", () => {
  let container: HTMLDivElement;
  let root: Root;
  let store: ReturnType<typeof createStore>;
  let battery: MockBatteryManager;
  let getBattery: ReturnType<typeof vi.fn<() => Promise<BatteryManager>>>;
  let originalGetBattery: PropertyDescriptor | undefined;

  beforeAll(() => {
    (
      globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    localStorage.clear();
    originalGetBattery = Object.getOwnPropertyDescriptor(
      navigator,
      "getBattery",
    );
    battery = new MockBatteryManager();
    getBattery = vi
      .fn<() => Promise<BatteryManager>>()
      .mockResolvedValue(battery);
    Object.defineProperty(navigator, "getBattery", {
      configurable: true,
      value: getBattery,
    });
    store = createStore();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
    if (originalGetBattery) {
      Object.defineProperty(navigator, "getBattery", originalGetBattery);
    } else {
      delete navigator.getBattery;
    }
    vi.restoreAllMocks();
  });

  async function mount(strictMode = false) {
    const content = (
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );
    await act(async () => {
      root.render(strictMode ? <StrictMode>{content}</StrictMode> : content);
    });
  }

  function expectStatus(percentage: number | null, charging: boolean | null) {
    expect(store.get(batteryPercentageAtom)).toBe(percentage);
    expect(store.get(batteryChargingAtom)).toBe(charging);
  }

  it("does not request battery information while disabled", async () => {
    await mount();

    expect(getBattery).not.toHaveBeenCalled();
    expectStatus(null, null);
  });

  it("keeps battery information unavailable when the API is absent", async () => {
    Object.defineProperty(navigator, "getBattery", { value: undefined });
    store.set(settingClientBatteryIndicator, true);

    await mount();

    expect(store.get(batterySupportAtom)).toBe(false);
    expect(getBattery).not.toHaveBeenCalled();
    expectStatus(null, null);
  });

  it.each([
    [0, 0],
    [0.626, 63],
    [1, 100],
  ])("rounds initial level %s to %s percent", async (level, percentage) => {
    battery.level = level;
    battery.charging = true;
    store.set(settingClientBatteryIndicator, true);

    await mount();

    expectStatus(percentage, true);
  });

  it("updates percentage and charging state from battery events", async () => {
    store.set(settingClientBatteryIndicator, true);
    await mount();

    act(() => {
      battery.level = 0.2;
      battery.dispatchEvent(new Event("levelchange"));
    });
    expectStatus(20, false);

    act(() => {
      battery.charging = true;
      battery.dispatchEvent(new Event("chargingchange"));
    });
    expectStatus(20, true);
  });

  it("clears state and listeners when disabled, and reads fresh state when re-enabled", async () => {
    const addListener = vi.spyOn(battery, "addEventListener");
    const removeListener = vi.spyOn(battery, "removeEventListener");
    store.set(settingClientBatteryIndicator, true);
    await mount();

    act(() => store.set(settingClientBatteryIndicator, false));

    expectStatus(null, null);
    for (const [type, listener] of addListener.mock.calls) {
      expect(removeListener).toHaveBeenCalledWith(type, listener);
    }

    battery.level = 0.1;
    battery.dispatchEvent(new Event("levelchange"));
    expectStatus(null, null);

    await act(async () => store.set(settingClientBatteryIndicator, true));

    expect(getBattery).toHaveBeenCalledTimes(2);
    expectStatus(10, false);
  });

  it("removes both listeners and clears state on unmount", async () => {
    const addListener = vi.spyOn(battery, "addEventListener");
    const removeListener = vi.spyOn(battery, "removeEventListener");
    store.set(settingClientBatteryIndicator, true);
    await mount();

    act(() => root.unmount());

    expect(addListener).toHaveBeenCalledTimes(2);
    expect(removeListener).toHaveBeenCalledTimes(2);
    for (const [type, listener] of addListener.mock.calls) {
      expect(removeListener).toHaveBeenCalledWith(type, listener);
    }
    battery.level = 0;
    battery.charging = true;
    battery.dispatchEvent(new Event("levelchange"));
    battery.dispatchEvent(new Event("chargingchange"));
    expectStatus(null, null);
  });

  it("handles a rejected request without exposing battery information", async () => {
    getBattery.mockRejectedValue(
      new DOMException("Blocked", "NotAllowedError"),
    );
    store.set(settingClientBatteryIndicator, true);

    await mount();

    expectStatus(null, null);
  });

  it("handles synchronous API errors", async () => {
    getBattery.mockImplementation(() => {
      throw new DOMException("Insecure context", "SecurityError");
    });
    store.set(settingClientBatteryIndicator, true);

    await mount();

    expectStatus(null, null);
  });

  it("ignores a request that resolves after disabling the setting", async () => {
    let resolveBattery!: (manager: BatteryManager) => void;
    getBattery.mockReturnValue(
      new Promise((resolve) => {
        resolveBattery = resolve;
      }),
    );
    const addListener = vi.spyOn(battery, "addEventListener");
    store.set(settingClientBatteryIndicator, true);
    await mount();

    act(() => store.set(settingClientBatteryIndicator, false));
    await act(async () => resolveBattery(battery));

    expect(addListener).not.toHaveBeenCalled();
    expectStatus(null, null);
  });

  it("ignores a request that resolves after unmount", async () => {
    let resolveBattery!: (manager: BatteryManager) => void;
    getBattery.mockReturnValue(
      new Promise((resolve) => {
        resolveBattery = resolve;
      }),
    );
    const addListener = vi.spyOn(battery, "addEventListener");
    store.set(settingClientBatteryIndicator, true);
    await mount();

    act(() => root.unmount());
    await act(async () => resolveBattery(battery));

    expect(addListener).not.toHaveBeenCalled();
    expectStatus(null, null);
  });

  it.each(["resolve", "reject"])(
    "ignores an obsolete request's %s after re-enabling",
    async (outcome) => {
      let resolveBattery!: (manager: BatteryManager) => void;
      let rejectBattery!: (error: Error) => void;
      getBattery.mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolveBattery = resolve;
          rejectBattery = reject;
        }),
      );
      const obsoleteBattery = new MockBatteryManager();
      obsoleteBattery.level = 0;
      obsoleteBattery.charging = true;
      const addListener = vi.spyOn(obsoleteBattery, "addEventListener");
      store.set(settingClientBatteryIndicator, true);
      await mount();

      act(() => store.set(settingClientBatteryIndicator, false));
      await act(async () => store.set(settingClientBatteryIndicator, true));
      expectStatus(63, false);

      await act(async () => {
        if (outcome === "resolve") resolveBattery(obsoleteBattery);
        else rejectBattery(new Error("Obsolete request failed"));
      });

      expect(addListener).not.toHaveBeenCalled();
      expectStatus(63, false);
    },
  );

  it("keeps a single pair of listeners through StrictMode effect replay", async () => {
    const addListener = vi.spyOn(battery, "addEventListener");
    const removeListener = vi.spyOn(battery, "removeEventListener");
    store.set(settingClientBatteryIndicator, true);

    await mount(true);

    expect(addListener).toHaveBeenCalledTimes(2);
    expectStatus(63, false);

    act(() => {
      battery.level = 0.4;
      battery.dispatchEvent(new Event("levelchange"));
    });
    expectStatus(40, false);

    act(() => root.unmount());

    expect(removeListener).toHaveBeenCalledTimes(2);
    expectStatus(null, null);
  });
});
