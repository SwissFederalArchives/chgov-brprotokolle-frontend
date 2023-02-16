import * as React from 'react';
import ReactMirador from './image/ReactMirador';
import MediaPlayer from './media/MediaPlayer';
import PlainTextViewer from './plainText/PlainTextViewer';
import './viewer.css';
import PdfViewer from "./pdf/PdfViewer";
import {useContext} from "react";
import {AppContext} from "../AppContext";


export default function Viewer() {

    const {currentManifest} = useContext(AppContext);
    if (!currentManifest) {
        return <></>;
    }

    if (currentManifest.images.length > 0) {
        return  <div className="aiiif-viewer">
           <ReactMirador />
        </div>;
    }

    if (currentManifest.itemsType === 'audioVideo') {
        return <div className="aiiif-viewer">
            <MediaPlayer />
        </div>;
    }

    if (currentManifest.itemsType === 'plain') {
        return <div className="aiiif-viewer">
            <PlainTextViewer />
        </div>;
    }

    if (currentManifest.itemsType=== 'pdf') {
        return <PdfViewer />;
    }

    return <></>;
}
