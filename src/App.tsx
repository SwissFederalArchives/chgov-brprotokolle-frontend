import React, {Suspense, useState, useEffect} from 'react';
import {
    BrowserRouter as Router,
} from "react-router-dom";
import ManifestHistory from './lib/ManifestHistory';
import {I18nextProvider, Translation } from 'react-i18next';
import i18n from 'i18next';
import IConfigParameter from './interface/IConfigParameter';
import Config from './lib/Config';
import './css/App.css';
import Cache from "./lib/Cache";
import IManifestData from "./interface/IManifestData";
import PresentationApi from "./fetch/PresentationApi";
import TreeBuilder from "./treeView/TreeBuilder";
import ManifestData from "./entity/ManifestData";
import {getLocalized, isSingleManifest} from "./lib/ManifestHelpers";
import InitI18n from './lib/InitI18n';
import {AppContext} from "./AppContext";
import {AnnotationType, HitType} from "./fetch/SearchApi";
import Main from "./layout/Main";
import {IAlertContent} from "./Alert";
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

interface IProps {
    config: IConfigParameter;
}

declare let global: {
    config: Config;
};

InitI18n();

const theme = createTheme({
    palette: {
        primary: {
            main: '#069'
        },
    }
});

export default function App(props: IProps) {



    Cache.ee.setMaxListeners(100);
    global.config = new Config(props.config);

    const [currentManifest, setCurrentManifest] = useState<IManifestData | undefined>(undefined);
    const [currentFolder, setCurrentFolder] = useState<IManifestData | undefined>(undefined);
    const [treeDate, setTreeDate] = useState<number>(Date.now());
    const [authDate, setAuthDate] = useState<number>(0);
    let initialQ = PresentationApi.getGetParameter('q') ?? '';
    let initialCv = PresentationApi.getGetParameter('cv') ?? '';
    let initialLine = PresentationApi.getGetParameter('line') ?? '';
    let initialTab = initialQ !== '' ? 'search' : PresentationApi.getGetParameter('tab') ?? 'metadata';
    const [tab, setTab] = useState<string>(initialTab);
    const [q, setQ] = useState<string>(initialQ);
    const [cv, setCv] = useState<string>(initialCv);
    const [line, setLine] = useState<string>(initialLine);
    const [page, setPage] = useState<number>(0);
    const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationType | undefined>(undefined);
    const [searchResult, setSearchResult] = useState<HitType[]>([]);
    const [alert, setAlert] = useState<IAlertContent | undefined>(undefined);

    const setCurrentManifest0 = (id?: string, history: boolean = true) => {

        if (!id) {
            id = PresentationApi.getIdFromCurrentUrl();
        }
        if (!id) {
            return;
        }
        const url = id;

        return new Promise((resolve, reject) => (
            PresentationApi.get(url).then((currentManifest: IManifestData) =>  {

                if (history) {
                    ManifestHistory.pageChanged(
                        currentManifest.request ?? currentManifest.id,
                        getLocalized(currentManifest.label)
                    );
                }

                if (currentManifest.type === 'Collection') {
                    const currentFolder = currentManifest;
                    setPage(0);
                    setCurrentManifest(currentManifest);
                    setCurrentFolder(currentFolder);
                    setCurrentAnnotation(undefined);
                    setSearchResult([]);
                    if (!currentManifest.restricted) {
                        TreeBuilder.buildCache(currentFolder.id, () => {
                            setTreeDate(Date.now());
                        });
                    }
                    resolve(currentManifest);
                } else if (!isSingleManifest(currentManifest)) {
                    PresentationApi.get(currentManifest.parentId).then((currentFolder: IManifestData) => {
                        setPage(0);
                        setCurrentManifest(currentManifest);
                        setCurrentFolder(currentFolder);
                        setCurrentAnnotation(undefined);
                        setSearchResult([]);
                        TreeBuilder.buildCache(currentFolder.id, () => {
                            setTreeDate(Date.now());
                        });
                        resolve(currentManifest);
                    }).catch(r => setAlert(r));
                } else {
                    const currentFolder = new ManifestData();
                    currentFolder.type = 'Manifest';
                    setCurrentManifest(currentManifest);
                    setCurrentFolder(currentFolder);
                    resolve(currentManifest);
                }
            }).catch(r => {
                setAlert(r);
                reject(r);
            })
        ));
    }

    const setTab0 = (t: string) => {
        if (currentManifest) {
            ManifestHistory.pageChanged(
                currentManifest.request ?? currentManifest.id,
                getLocalized(currentManifest.label),
                undefined,
                t
            );
            setTab(t);
        }
    }

    const setQ0 = (q: string) => {
        if (currentManifest) {
            ManifestHistory.pageChanged(
                currentManifest.request ?? currentManifest.id,
                getLocalized(currentManifest.label),
                q
            );
            setQ(q);
        }
    }

    const setCv0 = (cv: string) => {
        console.log('setcv', cv);
        if (currentManifest) {
            ManifestHistory.pageChanged(
                currentManifest.request ?? currentManifest.id,
                getLocalized(currentManifest.label),
                cv
            );
            setCv(cv);
        }
    }

    const setLine0 = (line: string) => {
        console.log('setline', line);
        if (currentManifest) {
            ManifestHistory.pageChanged(
                currentManifest.request ?? currentManifest.id,
                getLocalized(currentManifest.label),
                line
            );
            setLine(line);
        }
    }

    useEffect(() => {
        const tokenReceived = () => {
            setAuthDate(Date.now());
            setCurrentManifest0();
        }

        const refresh = () => {
            setCurrentManifest0();
        }

        Cache.ee.addListener('token-changed', tokenReceived);
        i18n.on('languageChanged', refresh);

        window.addEventListener('popstate', function(event) {
            const backId = ManifestHistory.goBack();
            if (backId) {
                setCurrentManifest0(backId)
            }
        });

        setCurrentManifest0();

        return () => {
            Cache.ee.removeListener('token-changed', tokenReceived);
            i18n.off('languageChanged', refresh);
        }
    }, []);

    const appContextValue= {treeDate, tab, setTab: setTab0, page, setPage, currentManifest, setCurrentManifest:
        setCurrentManifest0, currentFolder, setCurrentFolder, authDate, setAuthDate, currentAnnotation,
        setCurrentAnnotation, searchResult, setSearchResult, q, setQ: setQ0, cv, setCv: setCv0, line, setLine0, alert, setAlert};

    return (
        <Suspense fallback={null}>
            <AppContext.Provider value={appContextValue}>
                <I18nextProvider i18n={i18n}>
                <Router>
                    <Translation>
                        {() => (
                            <MuiThemeProvider theme={theme}>
                                <Main />
                            </MuiThemeProvider>
                        )}
                    </Translation>
                </Router>
                </I18nextProvider>
            </AppContext.Provider>
        </Suspense>
    );
}
