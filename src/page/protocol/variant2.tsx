import * as React from 'react';
import Viewer from "../../viewer/Viewer";
import Splitter from "../../splitter/Splitter";
import {isSingleManifest, isSingleRoot} from "../../lib/ManifestHelpers";
import PageProtocol3 from "./variant3";
import InfoBar from "../../infoBar/InfoBar";
import {useContext} from "react";
import {AppContext} from "../../AppContext";
import TabButtons from "../../infoBar/TabButtons";
import Config from "../../lib/Config";

declare let global: {
    config: Config;
};

export default function PageProtocol2() {

    const {tab, currentManifest, currentFolder} = useContext(AppContext);

    if (!currentManifest || !currentFolder) {
        return <></>;
    }

    if (isSingleManifest(currentManifest)) {
        return <Viewer />;
    }

    if (global.config.getHideUnbranchedTrees() && isSingleRoot(currentFolder)) {
        return <PageProtocol3/>;
    }

    if (tab === '') {
        return <>
            <PageProtocol3 />
            <TabButtons />
        </>
    }

    return <>
            <Splitter
            id="content0"
            a={<PageProtocol3/>}
            b={<InfoBar key={currentManifest.id} />}
            aSize={80}
            direction="vertical"
        />
        <TabButtons />
    </>
}
