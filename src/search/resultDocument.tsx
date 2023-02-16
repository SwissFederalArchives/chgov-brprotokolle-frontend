import React from 'react';
import { Link } from 'react-router-dom';
import * as DOMPurify from "dompurify";
import i18next from 'i18next';
import { Translation } from 'react-i18next';
import { IHighlightInformation, IHighlightDocument, IOCRHighlight } from '../interface/IOcrSearchData';
import SnippetView from './snippetView';

interface IProps {
    hl: {},
    ocr_hl: IOCRHighlight,
    query: string,
    doc: IHighlightDocument,
    snippets: string,
}

interface IState {
    renderedImage: {
        width: number,
        height: number,
        x: number,
        y: number
    } | undefined,
}

class ResultDocument extends React.Component<IProps, IState> {
    getImageUrl(region: IHighlightInformation, width?: number) {
        const { doc } = this.props;
        const { id: volId, source: collection } = doc;

        const regionStr = `${region.ulx},${region.uly},${region.lrx - region.ulx},${region.lry - region.uly}`;

        const imagePath = encodeURIComponent(collection + '/' + volId + '.jpg');
        const widthStr = width ? `${width},` : 'full';
        return `${process.env.REACT_APP_IMAGE_API_BASE}/${imagePath}/${regionStr}/${widthStr}/0/default.jpg`;
    }

    highlightDocument(doc: IHighlightDocument, highlights: {}) {
        if (typeof highlights !== 'undefined') {
            Object.keys(highlights).forEach((field) => {
                if (Array.isArray(doc[field])) {
                    doc[field] = doc[field].map((fval: string) =>
                        this.highlightFieldValue(fval, highlights[field])
                    );
                } else {
                    doc[field] = this.highlightFieldValue(doc[field], highlights[field]);
                }
            });
        }
        return doc;
    }

    highlightFieldValue(val: string, highlights: string[]) {
        let out = val;
        highlights.forEach((hl: string) => {
            const rawText = hl.replace(/<\/?em>/g, '');
            if (out.indexOf(rawText) > -1) {
                out = out.split(rawText).join(hl);
            }
        });
        return out;
    }

    render() {
        const { hl, ocr_hl, query, snippets } = this.props;
        const doc = this.highlightDocument(this.props.doc, hl);
        const collection = this.props.doc.source;
        const language = i18next.language;

        const manifestUri = encodeURIComponent(`${process.env.REACT_APP_MANIFEST_API_BASE}${collection}/${collection}.json`);
        const viewerUrl = `${process.env.REACT_APP_VIEWER_PAGE_URL}?manifest=${manifestUri}&cv=${doc.id}&q=${query}&lang=${language}`;
        return (
            <Translation ns="common">
                {(t) => (
                    <div className="result-document">
                        <h2>
                            <Link
                                className="highlightable"
                                to={viewerUrl}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(doc.title) }}
                            />
                        </h2>
                        {parseInt(snippets) > 1 && (<p>
                            {t(`searchResultsMatchingPassages`, { amount: ocr_hl?.numTotal || '0' })}
                        </p>)}
                        {ocr_hl &&
                            ocr_hl.snippets.map((snip) => (
                                <SnippetView
                                    key={snip.text}
                                    snippet={snip}
                                    docId={doc.id}
                                    query={query}
                                    manifestUri={manifestUri}
                                    getImageUrl={this.getImageUrl.bind(this)}
                                />
                            ))}
                    </div>
                )}
            </Translation>
        );
    }
}

export default ResultDocument;
