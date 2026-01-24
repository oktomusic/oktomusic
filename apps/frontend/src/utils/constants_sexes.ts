import { t } from "@lingui/core/macro";

interface Sexes {
  readonly XY: string;
  readonly XX: string;
}

interface SexesOrUnspecified extends Sexes {
  unspecified: string;
}

export type SexesKeys = keyof SexesOrUnspecified;

export function getSexes(): SexesOrUnspecified {
  return {
    XY: t`Man`,
    XX: t`Woman`,
    unspecified: t`Unspecified`,
  };
}
