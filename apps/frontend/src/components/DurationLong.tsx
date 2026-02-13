import { t } from "@lingui/core/macro";

import { getDurationComponents } from "../utils/format_duration";

interface DurationLongProps {
  readonly durationMs: number;
}

export function DurationLong(props: DurationLongProps) {
  const duration = getDurationComponents(props.durationMs);

  if ("hours" in duration) {
    const hours = duration.hours;
    const minutes = duration.minutes;
    return t`${hours}h ${minutes}min`;
  }

  if ("minutes" in duration) {
    const minutes = duration.minutes;
    const seconds = duration.seconds;
    return t`${minutes}min ${seconds}s`;
  }

  const seconds = duration.seconds;
  return t`${seconds}s`;
}
