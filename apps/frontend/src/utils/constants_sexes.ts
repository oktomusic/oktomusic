import { useLingui } from "@lingui/react/macro";

interface Sexes {
  readonly XY: string;
  readonly XX: string;
}

interface SexesOrUnspecified extends Sexes {
  unspecified: string;
}

export type SexesKeys = keyof SexesOrUnspecified;

export function useSexes(): SexesOrUnspecified {
  const { t } = useLingui();

  return {
    XY: t`Man`,
    XX: t`Woman`,
    unspecified: t`Unspecified`,
  };
}
