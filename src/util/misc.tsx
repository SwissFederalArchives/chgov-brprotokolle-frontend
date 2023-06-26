import i18next, { TOptions } from "i18next";

export const stringToNumberArray = (str?: string | null): number[] => {
  if (str === null || str === undefined) {
    return [];
  }
  return str.split(',').map((s) => Number(s));
};

export const numberArrayToString = (arr?: number[] | null): string => {
  if (arr === null || arr === undefined) {
    return '';
  }
  return arr.join(',');
};

export const setPageTitle = (pageKey: string, options?: TOptions) => {
  if (i18next.exists('pageTitle') && i18next.exists(`pageTitleIndividual${pageKey}`)) {
    const title = i18next.t('pageTitle', { individual: i18next.t(`pageTitleIndividual${pageKey}`, options ?? {}) });
    document.title = title;
  }
};

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);