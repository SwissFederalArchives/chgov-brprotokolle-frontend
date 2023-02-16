import * as React from 'react';
import { useContext, useState, useEffect } from "react";
import Main from "../../main/main";
import Viewer from "../../viewer/Viewer";
import IManifestData from "../../interface/IManifestData";
import { isSingleManifest } from "../../lib/ManifestHelpers";
import {AppContext} from "../../AppContext";


export default function PageProtocol3() {
    const { currentManifest, setCurrentManifest } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    

    useEffect(() => {
        setIsLoading(true);
        setCurrentManifest('', false)?.then(() => {
            setIsLoading(false);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading || !currentManifest) {
        return <Main />;
    }

    if (isSingleManifest(currentManifest)) {
        return <Viewer />;
    }

    const size = getSize(currentManifest);

    if (size === 0) {
        return null;
    }

    if (isAudio(currentManifest)) {
        return <div className="aiiif-content-audio">
            <Viewer />
        </div>;
    }

    return <Viewer />;
}

function isAudio(currentManifest: IManifestData) {
    return currentManifest.resource && currentManifest.resource.type === 'audio';
}

function getSize(currentManifest: IManifestData): number {
    if (!currentManifest) {
        return 0;
    }

    if (['audioVideo', 'image', 'plain', 'pdf'].includes(currentManifest.itemsType )) {
        return 50;
    }

    return 0;
}
