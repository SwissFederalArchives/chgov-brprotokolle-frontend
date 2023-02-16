import { createInstance } from '@jonkoops/matomo-tracker-react'

const urlBase = process.env.REACT_APP_MATOMO_BASE_URL;
const siteId = process.env.REACT_APP_MATOMO_SITEID;
const trackerUrl = process.env.REACT_APP_MATOMO_TRACKER_URL || `${urlBase}piwik.php`;
const srcUrl = process.env.REACT_APP_MATOMO_SRC_URL || `${urlBase}piwik.js`;

const disabled = !(urlBase && siteId);

export default createInstance({
    urlBase: `${urlBase}`,
    siteId: Number(siteId) || 99999999999, // Fallback required...
    userId: undefined, // optional, default value: `undefined`.
    trackerUrl, // optional, default value: `${urlBase}matomo.php`
    srcUrl, // optional, default value: `${urlBase}matomo.js`
    disabled, // optional, false by default. Makes all tracking calls no-ops if set to true.
    heartBeat: { // optional, enabled by default
        active: true, // optional, default value: true
        seconds: 15 // optional, default value: `15
    },
    linkTracking: false, // optional, default value: true
    configurations: { // optional, default value: {}
        // any valid matomo configuration, all below are optional
        // disableCookies: true,
        // setSecureCookie: true,
        // setRequestMethod: 'POST'
    }
})