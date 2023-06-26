import React from 'react';
import { Translation } from 'react-i18next';
import {
  IHighlightDocument,
  IOCRHighlight,
} from '../interface/IOcrSearchData';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SnippetView from './snippetView';

interface IProps {
  doc: IHighlightDocument;
  hl: IOCRHighlight;
  query: string;
  snippets: number;
}

const SearchResultsDocumentOcr = (props: IProps) => {
  const { doc, hl, query, snippets } = props;
  const manifestUri = encodeURIComponent(
    `${process.env.REACT_APP_MANIFEST_API_BASE}${doc.source}/${doc.source}.json`
  );

  const getDetailLink = () => {
    return `${process.env.REACT_APP_VIEWER_PAGE_URL}?manifest=${manifestUri}&cv=${doc.id}&q=${query}`;
  };

  return (
    <Translation ns="common">
      {(t) => (
        <div className="result-document-ocr">
          <h2>
            <Link
              className="highlightable"
              to={getDetailLink()}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(doc.title),
              }}
            />
          </h2>
          {snippets > 1 && (
            <p>
              {t(`searchResultsMatchingPassages`, {
                amount: hl?.numTotal || '0',
              })}
            </p>
          )}
          {hl?.snippets?.map((snip) => (
            <SnippetView
              key={snip.text}
              snippet={snip}
              doc={doc}
              query={query}
              manifestUri={manifestUri}
            />
          ))}
        </div>
      )}
    </Translation>
  );
};

export default SearchResultsDocumentOcr;
