import { useLingui } from "@lingui/react/macro";
import { useAtomValue } from "jotai";
import {
  LuBatteryCharging,
  LuBatteryFull,
  LuBatteryLow,
  LuBatteryMedium,
} from "react-icons/lu";

import {
  batteryChargingAtom,
  batteryPercentageAtom,
} from "../atoms/app/battery.ts";
import { settingClientBatteryIndicator } from "../atoms/app/settings_client.ts";

export function BatteryIndicator() {
  const { t, i18n } = useLingui();

  const enabled = useAtomValue(settingClientBatteryIndicator);
  const percentage = useAtomValue(batteryPercentageAtom);
  const charging = useAtomValue(batteryChargingAtom);

  if (!enabled || percentage === null || charging === null) return null;

  let Icon = LuBatteryFull;
  if (charging) {
    Icon = LuBatteryCharging;
  } else if (percentage <= 20) {
    Icon = LuBatteryLow;
  } else if (percentage <= 60) {
    Icon = LuBatteryMedium;
  }

  const formattedPercentage = new Intl.NumberFormat(
    i18n.locales ?? i18n.locale,
    {
      style: "percent",
      maximumFractionDigits: 0,
    },
  ).format(percentage / 100);

  const label = charging
    ? t`Battery: ${formattedPercentage}, charging`
    : t`Battery: ${formattedPercentage}, not charging`;

  return (
    <span
      role="img"
      aria-label={label}
      className="flex shrink-0 items-center gap-1 text-sm tabular-nums"
    >
      <Icon className="size-6" aria-hidden="true" focusable="false" />
      <span>{formattedPercentage}</span>
    </span>
  );
}
