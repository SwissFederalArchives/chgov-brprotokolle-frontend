import React from 'react';
import { Link } from 'react-router-dom';
import i18next from 'i18next';
import * as DOMPurify from "dompurify";
import { IHighlightInformation, IHighlightSnippet } from '../interface/IOcrSearchData';

interface IProps {
    docId: string,
    query: string,
    getImageUrl: (region: IHighlightInformation, width?: number) => string,
    manifestUri: string,
    snippet: IHighlightSnippet
}

interface IState {
    renderedImage: {
        width: number,
        height: number,
        x: number,
        y: number
    } | undefined,
}



class SnippetView extends React.Component<IProps, IState> {
    state: Readonly<IState> = {
        renderedImage: undefined
    }

    img: HTMLImageElement | null = null;

    getHighlightStyle(region: IHighlightInformation, hlInfo: IHighlightInformation, hue: number): React.CSSProperties {
        let styles = {};
        const { renderedImage } = this.state;

        if (region && renderedImage) {
            const scaleX = 1;//2.08045;
            const scaleY = 1;//2.08672;
            const regionWidth = scaleX * region.lrx - scaleY * region.ulx;
            const scaleFactor = (regionWidth) ? renderedImage.width / regionWidth : 0;
            styles = {
                position: "absolute",
                left: `${scaleFactor * scaleX * hlInfo.ulx + renderedImage.x - 2}px`,
                top: `${scaleFactor * scaleY * hlInfo.uly + renderedImage.y - 2}px`,
                width: `${scaleFactor * (scaleX * hlInfo.lrx - scaleX * hlInfo.ulx)}px`,
                height: `${scaleFactor * (scaleY * hlInfo.lry - scaleY * hlInfo.uly)}px`,
                backgroundColor: `hsla(${hue}, 100%, 50%, 50%)`,
            }
        }

        return styles;
    }

    /**
     * LS 22.12.2022: Hotfix due to improperly scaled ocr information with pdfalto tool
     */
    applyMwHotfix = (docId: string, hlInfo: IHighlightInformation): IHighlightInformation => {
        const scaleX = 2.08045;
        const scaleY = 2.08672;
        const firstMwDocId = 32324175;
        const id = Number.parseInt(docId.substr(0, "32324175".length));
        if (id >= firstMwDocId) {
            return {
                ulx: Math.floor(scaleX * hlInfo.ulx),
                uly: Math.floor(scaleY * hlInfo.uly),
                lrx: Math.floor(scaleX * hlInfo.lrx),
                lry: Math.floor(scaleY * hlInfo.lry),
                page: hlInfo.page,
                text: hlInfo.text,
            } as IHighlightInformation;
        }
        return hlInfo;
    }

    render() {
        const { docId, query, getImageUrl, snippet, manifestUri } = this.props;
        if (snippet) {
            const { text, highlights } = snippet;
            const language = i18next.language;
            const viewerUrl = `${process.env.REACT_APP_VIEWER_PAGE_URL}?manifest=${manifestUri}&cv=${docId}&q=${query}&lang=${language}`;
            // get lowest parentRegionIdx of all highlights, to get relevant region
            const minParentRegionIdx = Math.min(...highlights.flatMap((hls) => hls.map((hl) => hl.parentRegionIdx)));
            const region = snippet.regions[minParentRegionIdx];

            return (
                <div className="snippet-display">
                    <>
                        <Link to={viewerUrl}>
                            <img
                                ref={(i) => (this.img = i)}
                                src={getImageUrl(this.applyMwHotfix(docId, region))}
                                alt=""
                            />
                        </Link>
                        {
                            this.state.renderedImage &&
                            highlights.flatMap((hls) =>
                                hls.filter(hl => hl.parentRegionIdx === minParentRegionIdx).map((hl) => (
                                    <div
                                        key={`${hl.lrx}_${hl.lry}_${hl.ulx}_${hl.uly}`}
                                        className="highlight-box"
                                        title={hl.text}
                                        style={this.getHighlightStyle(region, hl, 50)}
                                    />
                                ))
                            )
                        }
                        <p
                            className="highlightable"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }}
                        />
                    </>
                </div>
            );
        }
    }

    updateDimensions() {
        if (!this.img) {
            return;
        }

        this.setState({
            renderedImage: {
                x: this.img.offsetLeft,
                y: this.img.offsetTop,
                width: this.img.width,
                height: this.img.height,
            },
        });
    }

    componentDidMount() {
        if (this.img) {
            this.img.addEventListener("load", this.updateDimensions.bind(this));
            window.addEventListener("resize", this.updateDimensions.bind(this));
        }
    }

    componentWillUnmount() {
        if (this.img) {
            window.removeEventListener("resize", this.updateDimensions.bind(this));
        }
    }
}

export default SnippetView;
