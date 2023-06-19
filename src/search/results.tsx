import React from 'react';
import { Translation } from 'react-i18next';
import {
  ISearchResults,
  IHighlightDocument,
  IOCRHighlight,
  ISolrRequest,
} from '../interface/IOcrSearchData';
import ResultDocument from './resultDocument';

interface IProps {
  searchResults: ISearchResults | undefined;
  queryParams: ISolrRequest;
}

const SearchResults = (props: IProps) => {
  const { searchResults, queryParams } = props;

  return (
    <Translation ns="common">
      {(t) => (
        <section className="results">
          {searchResults?.response.docs
            .map((doc: IHighlightDocument, idx: number) => {
              return {
                doc,
                key: idx,
                ocrHl: searchResults.ocrHighlighting[doc.id].ocr_text,
                hl: {},
              };
            })
            .map(
              ({
                doc,
                key,
                hl,
                ocrHl,
              }: {
                doc: IHighlightDocument;
                key: number;
                hl: {};
                ocrHl: IOCRHighlight;
              }) => (
                <ResultDocument
                  key={key}
                  hl={hl}
                  ocr_hl={ocrHl}
                  doc={doc}
                  query={queryParams.q}
                  snippets={queryParams['hl.snippets']}
                />
              )
            )}
        </section>
      )}
    </Translation>
  );
};

export default SearchResults;
