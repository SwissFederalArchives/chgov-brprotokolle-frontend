import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  withRouter,
  RouteComponentProps,
  Link,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { Translation } from 'react-i18next';
import { LinearProgress } from '@mui/material';
import { ISearchResults, ISolrRequest } from 'interface/IOcrSearchData';
import { replaceSearchParameters } from '../util/url';
import { isSolrFrequencySortable } from '../util/solr';
import Tooltip from '../tooltip/tooltip';
import Config from '../lib/Config';
import DOMPurify from 'dompurify';

declare let global: {
  config: Config;
};

interface IProps extends RouteComponentProps<any> {
  queryParams: ISolrRequest;
  setQueryParams: (qp: ISolrRequest) => void;
  searchResults: ISearchResults | undefined;
  setSearchResults: (sr: ISearchResults) => void;
  sort: string;
  setSort: Dispatch<SetStateAction<string | null>>;
  errors: string[];
  setErrors: (e: string[]) => void;
}

const SearchFormSimple = (props: IProps) => {
  const {
    queryParams,
    setQueryParams,
    searchResults,
    setSearchResults,
    sort,
    setSort,
    errors,
    setErrors,
  } = props;
  const sources = ['gbooks', 'lunion'];
  const searchMode = 'advanced';

  const history = useHistory();
  const location = useLocation();

  const initialQuery =
    Object.fromEntries(new URLSearchParams(location.search))?.q?.trim() || '';

  const [query, setQuery] = useState(initialQuery);
  const [isSearchPending, setIsSearchPending] = useState(false);

  let abortController: AbortController | null = null;
  let defaultQueryParams: ISolrRequest = global.config.getSolrFieldConfig();
  const queryParam = query ? `&q=${query}` : '';

  useEffect(() => {
    if (query !== '') {
      onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query !== '') {
      onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.start, queryParams.sort]);

  const fetchResults = (params: Record<string, string>) => {
    const fetchUrl = `${
      process.env.REACT_APP_SOLR_API_BASE
    }?${new URLSearchParams(params)}`;

    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    abortController = new AbortController();

    setIsSearchPending(true);

    fetch(fetchUrl, { signal: abortController?.signal })
      .then((resp) => resp.json())
      .then((data: ISearchResults) => {
        setIsSearchPending(false);
        setSearchResults(data);
        setErrors([]);
      })
      .catch((err) => {
        setIsSearchPending(false);
        setSearchResults(undefined as any);
        setErrors([...errors, err?.name || '400BadSolrRequest']);
      });
  };

  const onSubmit = (evt?: React.SyntheticEvent) => {
    if (query === '') {
      evt?.preventDefault();
      return;
    }

    const start = queryParams?.start || '1';
    const fq = [];
    if (evt) {
      evt.preventDefault();
      history.push(replaceSearchParameters({ q: query, page: null }));
    }
    const params = {
      ...queryParams,
      q: query,
      fl: defaultQueryParams.fl,
    };
    if (Array.isArray(sources) && sources.length === 1) {
      fq.push(`source:${sources[0]}`);
    }
    if (fq.length > 0) {
      params.fq = fq.join(' AND ');
    }
    if (start !== '0') {
      params.start = start;
    }
    if (sort === 'frequency') {
      const termfrequency = `termfreq(ocr_text,'${query}')`;

      if (isSolrFrequencySortable(query)) {
        params.fl = `${defaultQueryParams.fl},freq:${termfrequency}`;
        params.sort = `${termfrequency} desc`;
      } else {
        delete params.sort;
        setSort(null);
      }
    } else if (!['relevance'].includes(sort)) {
      params.sort = sort;
    } else {
      delete params.sort;
      setSort(null);
    }

    // Set pending state, update query params and fetch results
    setIsSearchPending(true);
    setQueryParams(params);
    fetchResults(params);
  };

  return (
    <Translation ns="common">
      {(t) => (
        <>
          <form className="search-form" onSubmit={onSubmit.bind(this)}>
            <div className="search-form-inner search-form-inner--advanced">
              <div className="search-form-input">
                <label>{t('searchAdvancedInputLabel')}</label>
                <div className="search-form-input-wrap">
                  <div className="search-form-input-inner">
                    <input
                      type="text"
                      className={`form-control ${
                        errors.find((err) => err === '400BadSolrRequest')
                          ? 'is-invalid'
                          : ''
                      }`}
                      disabled={isSearchPending || sources.length === 0}
                      value={query}
                      onChange={(ev) => setQuery(ev.currentTarget.value.trim())}
                    ></input>
                    <div className="mdc-linear-progress-wrap">
                      {isSearchPending && (
                        <LinearProgress className="mdc-linear-progress" />
                      )}
                    </div>
                  </div>
                  <Tooltip
                    className="search-form-tooltip"
                    title={
                      <div
                        dangerouslySetInnerHTML={{
                          // eslint-disable-line react/no-danger
                          __html: DOMPurify.sanitize(
                            `${t('searchAdvancedInputTooltip')}`
                          ),
                        }}
                      />
                    }
                  />
                </div>
              </div>
              <div className="search-form-controls">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={query === ''}
                >
                  {t('searchAdvancedButton')}
                </button>
              </div>
            </div>
            <div className="search-form-info">
              <p className="mdc-typography search-form-info__link">
                <Link to={`?searchMode=${searchMode}${queryParam}`}>
                  {t(`searchAdvancedOpen`)}
                </Link>
              </p>
              {!isSearchPending && searchResults && queryParams.q && (
                <p
                  className="mdc-typography search-form-info__text"
                  dangerouslySetInnerHTML={{
                    // eslint-disable-line react/no-danger
                    __html: DOMPurify.sanitize(
                      `${t('searchFormFoundMatches', {
                        numFound: searchResults?.response?.numFound,
                        q: query,
                        QTime: searchResults?.responseHeader?.QTime,
                      })}`
                    ),
                  }}
                />
              )}
            </div>
          </form>
        </>
      )}
    </Translation>
  );
};

export default withRouter(SearchFormSimple);
