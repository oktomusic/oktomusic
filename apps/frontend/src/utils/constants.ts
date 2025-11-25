import { t } from "@lingui/core/macro";

interface Sexes {
  readonly XY: string;
  readonly XX: string;
}

interface SexesOrUnspecified extends Sexes {
  unspecified: string;
}

type SexesKeys = keyof SexesOrUnspecified;

function getSexes(): SexesOrUnspecified {
  return {
    XY: t`Man`,
    XX: t`Woman`,
    unspecified: t`Unspecified`,
  };
}

export { getSexes, SexesKeys };
