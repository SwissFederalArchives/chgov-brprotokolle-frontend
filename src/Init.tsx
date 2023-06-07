import * as React from 'react';
import App from './App';
import { MatomoProvider } from '@jonkoops/matomo-tracker-react';
import IConfigParameter from './interface/IConfigParameter';
import i18n from "i18next";
import { createRoot } from 'react-dom/client';
import matomoInstance from './lib/Matomo';

export default class Init {

    constructor(config: IConfigParameter) {

        const container = document.getElementById(config.id);
        const root = createRoot(container!);
        root.render(
            <MatomoProvider value={matomoInstance}>
                <App config={config}/>
            </MatomoProvider>
        );
    }

    changeLanguage(code: string) {
        i18n.changeLanguage(code).then(r => {});
    }
}
