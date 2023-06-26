import React, { ReactNode } from 'react';
import { Translation } from 'react-i18next';
import {
  ISearchResultsType,
  ISearchResults,
  IHighlightDocument,
  IOCRHighlight,
  ISolrRequest,
} from '../interface/IOcrSearchData';
import { getResultsHighlightingMode } from './util';
import SearchResultsDocument from './resultsDocument';
import SearchResultsDocumentOcr from './resultsDocumentOcr';

interface IProps {
  searchField: string;
  searchQuery: ISolrRequest | null;
  searchResults: ISearchResults | null;
}

const SearchResults = (props: IProps) => {
  const { searchField, searchResults, searchQuery } = props;
  if (!searchResults || !searchQuery) {
    return null;
  }
  let results: ReactNode | null = null;
  const highlightingMode = getResultsHighlightingMode(searchResults);

  const renderResults = () => {
    return (
      <>
        {searchResults.response.docs.map((doc: IHighlightDocument, idx: number) => {
          const hl: string[] = searchResults.highlighting[doc.id][searchField] ?? [];
          const key = doc.id;
          const query = searchQuery.q;

          return <SearchResultsDocument key={key} hl={hl} doc={doc} query={query} />;
        })}
      </>
    );
  };

  const renderOcrResults = () => {
    return (
      <>
        {searchResults.response.docs.map((doc: IHighlightDocument, idx: number) => {
          const hl: IOCRHighlight = searchResults.ocrHighlighting[doc.id][searchField];
          const key = doc.id;
          const query = searchQuery.q;
          const snippets = parseInt(searchQuery['hl.snippets'], 10);

          return <SearchResultsDocumentOcr key={key} hl={hl} doc={doc} query={query} snippets={snippets} />;
        })}
      </>
    );
  };

  switch (highlightingMode) {
    case ISearchResultsType.NORMAL:
      results = renderResults();
      break;
    case ISearchResultsType.OCR:
      results = renderOcrResults();
      break;
  }

  return <Translation ns="common">{(t) => <section className="results">{results}</section>}</Translation>;
};

export default SearchResults;
