import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import i18next from 'i18next';
import * as DOMPurify from 'dompurify';
import { IHighlightDocument, IHighlightInformation, IHighlightSnippet } from '../interface/IOcrSearchData';

interface IProps {
  doc: IHighlightDocument;
  query: string;
  manifestUri: string;
  snippet: IHighlightSnippet;
}

const SnippetView: React.FC<IProps> = ({ doc, query, manifestUri, snippet }) => {
  const [renderedImage, setRenderedImage] = useState<
    { width: number; height: number; x: number; y: number } | undefined
  >(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  const getImageUrl = (region: IHighlightInformation, width?: number) => {
    const { id: volId, source: collection } = doc;

    const regionStr = `${region.ulx},${region.uly},${region.lrx - region.ulx},${region.lry - region.uly}`;

    const imagePath = encodeURIComponent(collection + '/' + volId + '.jpg');
    const widthStr = width ? `${width},` : 'full';
    return `${process.env.REACT_APP_IMAGE_API_BASE}/${imagePath}/${regionStr}/${widthStr}/0/default.jpg`;
  };

  const getHighlightStyle = (
    region: IHighlightInformation,
    hlInfo: IHighlightInformation,
    hue: number
  ): React.CSSProperties => {
    let styles = {};

    if (region && renderedImage) {
      const scaleX = 1;
      const scaleY = 1;
      const regionWidth = scaleX * region.lrx - scaleY * region.ulx;
      const scaleFactor = regionWidth ? renderedImage.width / regionWidth : 0;
      styles = {
        position: 'absolute',
        left: `${scaleFactor * scaleX * hlInfo.ulx + renderedImage.x - 2}px`,
        top: `${scaleFactor * scaleY * hlInfo.uly + renderedImage.y - 2}px`,
        width: `${scaleFactor * (scaleX * hlInfo.lrx - scaleX * hlInfo.ulx)}px`,
        height: `${scaleFactor * (scaleY * hlInfo.lry - scaleY * hlInfo.uly)}px`,
        backgroundColor: `hsla(${hue}, 100%, 50%, 50%)`,
      };
    }

    return styles;
  };

  const applyMwHotfix = (hlInfo: IHighlightInformation): IHighlightInformation => {
    const scaleX = 2.08045;
    const scaleY = 2.08672;
    const firstMwDocId = 32324175;
    const id = Number.parseInt(doc.id.substring(0, '32324175'.length));
    if (id >= firstMwDocId) {
      return {
        ...hlInfo,
        ulx: Math.floor(scaleX * hlInfo.ulx),
        uly: Math.floor(scaleY * hlInfo.uly),
        lrx: Math.floor(scaleX * hlInfo.lrx),
        lry: Math.floor(scaleY * hlInfo.lry),
      };
    }
    return hlInfo;
  };

  const updateDimensions = () => {
    if (imgRef.current) {
      setRenderedImage({
        x: imgRef.current.offsetLeft,
        y: imgRef.current.offsetTop,
        width: imgRef.current.width,
        height: imgRef.current.height,
      });
    }
  };

  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.addEventListener('load', updateDimensions);
      window.addEventListener('resize', updateDimensions);

      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);

  if (snippet) {
    const { text, highlights } = snippet;
    const language = i18next.language;
    const viewerUrl = `${process.env.REACT_APP_VIEWER_PAGE_URL}?manifest=${manifestUri}&cv=${doc.id}&q=${query}&lang=${language}`;
    const minParentRegionIdx = Math.min(...highlights.flatMap((hls) => hls.map((hl) => hl.parentRegionIdx)));
    const region = snippet.regions[minParentRegionIdx];

    return (
      <div className="snippet-display">
        <Link to={viewerUrl}>
          <img ref={imgRef} src={getImageUrl(applyMwHotfix(region))} alt="" />
        </Link>
        {renderedImage &&
          highlights.flatMap((hls) =>
            hls
              .filter((hl) => hl.parentRegionIdx === minParentRegionIdx)
              .map((hl) => (
                <div
                  key={`${hl.lrx}_${hl.lry}_${hl.ulx}_${hl.uly}`}
                  className="highlight-box"
                  title={hl.text}
                  style={getHighlightStyle(region, hl, 50)}
                />
              ))
          )}
        <p className="highlightable" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }} />
      </div>
    );
  } else {
    return null;
  }
};

export default SnippetView;
