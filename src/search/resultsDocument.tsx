import React from 'react';
import { Translation } from 'react-i18next';
import { IHighlightDocument } from '../interface/IOcrSearchData';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

interface IProps {
  doc: IHighlightDocument;
  hl: string[];
  query: string;
}

const SearchResultsDocument = (props: IProps) => {
  const { doc, hl, query } = props;
  const text = hl.join(' ... ') || '';
  const manifestUri = encodeURIComponent(`${process.env.REACT_APP_MANIFEST_API_BASE}${doc.source}/${doc.source}.json`);
  const page = doc.id.split('-')[1];

  const getDetailLink = () => {
    return `${process.env.REACT_APP_VIEWER_PAGE_URL}?manifest=${manifestUri}&cv=${doc.id}&q=${query}`;
  };

  return (
    <Translation ns="common">
      {(t) => (
        <Link className="result-document" to={getDetailLink()}>
          <span className="highlightable" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }} />
          <strong
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(doc.title),
            }}
          />
          <span>{t(`page`, { page })}</span>
        </Link>
      )}
    </Translation>
  );
};

export default SearchResultsDocument;
