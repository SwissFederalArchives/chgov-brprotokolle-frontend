import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Translation } from 'react-i18next';
import { ISearchResults, ISolrRequest } from 'interface/IOcrSearchData';

import Pagination from '../pagination/pagination';
import SearchFormSimple from './formSimple';
import SearchFormAdvanced from './formAdvanced';
import SearchSorting from './sorting';
import SearchResults from './results';

import { prepareSolrSearchQuery } from './util';
import { useQueryState } from '../util/hooks';
import { numberArrayToString, stringToNumberArray } from '../util/misc';

import Config from '../lib/Config';

declare let global: {
  config: Config;
};

export const SEARCH_FIELD_FULL_TEXT = 'ocr_text';
export const SEARCH_FIELD_MARGINALIA = 'marginalia_text';

const Search = () => {
  const defaultSolrFieldConfig = global.config.getSolrFieldConfig();
  const abortController: MutableRefObject<AbortController | null> = useRef(new AbortController());

  const [searchMode] = useQueryState<'simple' | 'advanced'>('searchMode', 'simple');
  const [query, setQuery] = useQueryState('q', null, String, String);
  const [searchField, setSearchField] = useQueryState('searchField', SEARCH_FIELD_FULL_TEXT, String, String);
  const [fuzzy, setFuzzy] = useQueryState('fuzzy', 0, Number, String);
  const [yearRange, setYearRange] = useQueryState('yearRange', null, stringToNumberArray, numberArrayToString);
  const [sort, setSort] = useQueryState('mode', defaultSolrFieldConfig.sort ?? 'score desc', String, String);
  const [rows, setRows] = useQueryState('rows', Number(defaultSolrFieldConfig.rows ?? 25), Number, String);
  const [page, setPage] = useQueryState('page', 1, Number, String);

  const [searchQuery, setSearchQuery] = useState<ISolrRequest | null>(null);
  const [fetching, setFetching] = useState(false);
  const [searchResults, setSearchResults] = useState<ISearchResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const forceRerender = Number(!!(query || searchMode === 'advanced'));

  const searchRef = useRef(null);

  const numFound = parseInt((searchResults?.response?.numFound || '0').toString());
  const totalPages = Math.ceil(numFound / Number(rows));

  const resultsInfo = searchResults
    ? {
        query: query,
        numFound: Number(searchResults.response.numFound),
        time: searchResults.responseHeader.QTime,
      }
    : null;

  const setQueryState = (data: any) => {
    // Only call setter if value is in data
    if (data.query !== undefined) setQuery(data.query);
    if (data.fuzzy !== undefined) setFuzzy(data.fuzzy);
    if (data.searchField !== undefined) setSearchField(data.searchField);
    if (data.yearRange !== undefined) setYearRange(data.yearRange);
    if (data.page !== undefined) setPage(data.page);
    if (data.sort !== undefined) setSort(data.sort);
    if (data.rows !== undefined) setRows(data.rows);
  };

  const fetchResults = (params: ISolrRequest) => {
    if (params.q === '') return;

    const fetchUrl = `${process.env.REACT_APP_SOLR_API_BASE}?${new URLSearchParams(params as any)}`;

    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setFetching(true);
    setErrors([]);
    setSearchResults(null);

    fetch(fetchUrl, { signal: abortController.current?.signal })
      .then((resp) => resp.json())
      .then((data: ISearchResults) => {
        setSearchResults(data);
      })
      .catch((err) => {
        setErrors([...errors, err?.name || 'SyntaxError']);
      })
      .finally(() => {
        abortController.current = null;
        setFetching(false);
      });
  };

  useEffect(() => {
    setSearchQuery(
      prepareSolrSearchQuery(defaultSolrFieldConfig, searchMode, query, fuzzy, searchField, yearRange, rows, page, sort)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ query, fuzzy, searchField, yearRange, rows, page, sort })]);

  // Perform search
  useEffect(() => {
    if (searchQuery) {
      fetchResults(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (query === '') {
      setFetching(false);
      setSearchResults(null);
      setErrors([]);

      setSearchQuery(
        prepareSolrSearchQuery(
          defaultSolrFieldConfig,
          searchMode,
          query,
          fuzzy,
          searchField,
          yearRange,
          rows,
          page,
          sort
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode, query]);

  // Reset sort if search field is changed and the current sort is not valid for the new search field
  useEffect(() => {
    if (searchField === SEARCH_FIELD_MARGINALIA && sort === 'frequency') {
      setSort('score desc');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchField]);

  return (
    <Translation ns="common">
      {(t) => (
        <div className="search" key={forceRerender} ref={searchRef}>
          {searchMode === 'simple' && (
            <SearchFormSimple
              errors={errors}
              fetching={fetching}
              resultsInfo={resultsInfo}
              initialValues={{ query }}
              onSubmit={setQueryState}
            />
          )}
          {searchMode === 'advanced' && (
            <SearchFormAdvanced
              errors={errors}
              fetching={fetching}
              resultsInfo={resultsInfo}
              initialValues={{ query, fuzzy, searchField, yearRange }}
              onSubmit={setQueryState}
            />
          )}

          {numFound > 0 && (
            <SearchSorting
              initialValues={{ rows, sort }}
              query={query}
              onSubmit={setQueryState}
              searchField={searchField}
            />
          )}
          {totalPages > 1 && (
            <Pagination
              page={page}
              count={totalPages}
              numFound={numFound}
              rowsPerPage={rows}
              showFirstButton
              showLastButton
            />
          )}
          {numFound > 0 && (
            <SearchResults searchQuery={searchQuery} searchResults={searchResults} searchField={searchField} />
          )}
          {totalPages > 1 && (
            <Pagination
              page={Number(page)}
              count={totalPages}
              numFound={numFound}
              rowsPerPage={Number(rows)}
              showFirstButton
              showLastButton
              scrollToRefOnClick={searchRef}
            />
          )}
        </div>
      )}
    </Translation>
  );
};

export default Search;
