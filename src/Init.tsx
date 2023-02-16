import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { MatomoProvider } from '@jonkoops/matomo-tracker-react';
import * as serviceWorker from './serviceWorker';
import IConfigParameter from './interface/IConfigParameter';
import i18n from "i18next";

import matomoInstance from './lib/Matomo';

export default class Init {

    constructor(config: IConfigParameter) {

        ReactDOM.render(
            <MatomoProvider value={matomoInstance}>
                <App config={config} />
            </MatomoProvider>,
            document.getElementById(config.id)
        );
        serviceWorker.unregister();
    }


    changeLanguage(code: string) {
        i18n.changeLanguage(code);
    }

}
