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
    return (
      <time dateTime={duration.datetime}>{t`${hours}h ${minutes}min`}</time>
    );
  }

  if ("minutes" in duration) {
    const minutes = duration.minutes;
    const seconds = duration.seconds;
    return (
      <time dateTime={duration.datetime}>{t`${minutes}min ${seconds}s`}</time>
    );
  }

  const seconds = duration.seconds;
  return <time dateTime={duration.datetime}>{t`${seconds}s`}</time>;
}
