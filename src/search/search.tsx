import React, { useEffect, useState, useRef } from 'react';
import { Translation } from 'react-i18next';
import { useQueryState } from '../util/hooks';
import Pagination from '../pagination/pagination';
import SearchFormSimple from './formSimple';
import SearchFormAdvanced from './formAdvanced';
import SearchResults from '../search/results';
import SearchSorting from '../search/sorting';
import { ISearchResults, ISolrRequest } from 'interface/IOcrSearchData';
import Config from '../lib/Config';
import './search.css';

declare let global: {
  config: Config;
};

const Search = () => {
  const [searchMode, setSearchMode] = useQueryState('searchMode', '');
  const mode = searchMode === 'advanced' ? 'advanced' : 'simple';
  const [queryParams, setQueryParams] = useState<ISolrRequest>(
    global.config.getSolrFieldConfig()
  );
  const [searchResults, setSearchResults] = useState<
    ISearchResults | undefined
  >(undefined);
  const [page, setPage] = useQueryState('page', '1');
  const [rows, setRows] = useQueryState(
    'rows',
    global.config.getSolrFieldConfig().rows
  );
  const [sort, setSort] = useQueryState(
    'sort',
    global.config.getSolrFieldConfig().sort
  );
  const [fuzzy, setFuzzy] = useQueryState('fuzzy', '0');
  const [yearRange, setYearRange] = useQueryState('yearRange', '');
  const [errors, setErrors] = useState<string[]>([]);
  const searchRef = useRef(null);
  const firstRender = useRef(true);

  const numFound = parseInt(
    (searchResults?.response?.numFound || '0').toString()
  );
  const totalPages = Math.ceil(numFound / Number(rows));

  useEffect(() => {
    if (!firstRender.current) {
      setPage(null);
      setQueryParams({
        ...queryParams,
        rows: rows,
        sort: sort,
        start: String(0),
      });
    }
  }, [rows, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const newStart = (Number(page) - 1) * Number(rows);
    setQueryParams({
      ...queryParams,
      rows: rows,
      sort: sort,
      start: String(newStart),
    });
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    }

    return () => {
      firstRender.current = true;
    };
  }, []);

  const simpleSearchProps = {
    queryParams,
    setQueryParams,
    searchResults,
    setSearchResults,
    sort,
    setSort,
    errors,
    setErrors,
    setSearchMode,
  };

  const advancedSearchProps = {
    queryParams,
    setQueryParams,
    searchResults,
    setSearchResults,
    sort,
    setSort,
    yearRange,
    setYearRange,
    fuzzy,
    setFuzzy,
    errors,
    setErrors,
    setSearchMode,
  };

  return (
    <Translation ns="common">
      {(t) => (
        <div className="search" ref={searchRef}>
          {mode === 'simple' && <SearchFormSimple {...simpleSearchProps} />}
          {mode === 'advanced' && (
            <SearchFormAdvanced {...advancedSearchProps} />
          )}
          {numFound > 0 && (
            <SearchSorting
              rows={Number(rows)}
              setRows={setRows}
              sort={sort}
              setSort={setSort}
            />
          )}
          {totalPages > 1 && (
            <Pagination
              page={Number(page)}
              count={totalPages}
              numFound={numFound}
              rowsPerPage={Number(rows)}
              showFirstButton
              showLastButton
            />
          )}
          {numFound > 0 && (
            <SearchResults
              queryParams={queryParams}
              searchResults={searchResults}
            />
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
