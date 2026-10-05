import appConfig from '../app.json';

export const APP_NAME = 'Kural Daily';
export const APP_VERSION = appConfig.expo.version;

/** Store listing used by "Share the app". Update if the app is published under a different listing. */
export const STORE_URL = `https://play.google.com/store/apps/details?id=${appConfig.expo.android.package}`;

export const SHARE_APP_MESSAGE =
  `I'm reading one Thirukkural a day with ${APP_NAME}: the original Tamil couplet, a translation and ` +
  `the meaning, plus a simple way to learn them by heart.\n\n${STORE_URL}`;
