import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  withRouter,
  RouteComponentProps,
  Link,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { Translation } from 'react-i18next';
import { LinearProgress, Slider } from '@mui/material';
import * as DOMPurify from 'dompurify';
import { Cancel as CancelIcon } from '@mui/icons-material';

import RangeSlider from '../rangeSlider/rangeSlider';
import PresentationApi from '../fetch/PresentationApi';
import { ISearchResults, ISolrRequest } from 'interface/IOcrSearchData';
import IManifestData from '../interface/IManifestData';
import { buildManifest } from '../timeline/util';
import { replaceSearchParameters } from '../util/url';
import Tooltip from '../tooltip/tooltip';
import { numberArrayToString, stringToNumberArray } from '../util/misc';
import { isSolrExpertQuery, isSolrFrequencySortable } from '../util/solr';

import Config from '../lib/Config';

declare let global: {
  config: Config;
};

interface IProps extends RouteComponentProps<any> {
  queryParams: ISolrRequest;
  setQueryParams: (qp: ISolrRequest) => void;
  searchResults: ISearchResults | undefined;
  setSearchResults: (sr: ISearchResults) => void;
  yearRange: string;
  setYearRange: Dispatch<SetStateAction<string | null>>;
  fuzzy: string;
  setFuzzy: Dispatch<SetStateAction<string | null>>;
  errors: string[];
  setErrors: (errors: string[]) => void;
  sort: string;
  setSort: Dispatch<SetStateAction<string | null>>;
  autosubmit?: boolean;
}

const SearchFormAdvanced = (props: IProps) => {
  const {
    queryParams,
    setQueryParams,
    searchResults,
    setSearchResults,
    yearRange,
    setYearRange,
    fuzzy,
    setFuzzy,
    errors,
    setErrors,
    sort,
    setSort,
    autosubmit = false,
  } = props;
  const { start = '1' } = queryParams;
  const sources = ['gbooks', 'lunion'];

  const history = useHistory();
  const location = useLocation();

  const initialQuery =
    Object.fromEntries(new URLSearchParams(location.search))?.q?.trim() || '';

  const [query, setQuery] = useState(initialQuery);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [yearsArray, setYearsArray] = useState<string[] | undefined>(undefined);
  const [yearsFilter, setYearsFilter] = useState<number[]>([0, 0]);
  const [fuzzyFilter, setFuzzyFilter] = useState(fuzzy ? Number(fuzzy) : 0);

  let abortController: AbortController | null = null;
  let url: string | undefined =
    process.env.REACT_APP_DEFAULT_COLLECTION_MANIFEST;
  let defaultQueryParams: ISolrRequest = global.config.getSolrFieldConfig();

  useEffect(() => {
    fetchCollectionManifest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query !== '' || autosubmit) {
      onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.start, queryParams.sort]);

  const fetchCollectionManifest = () => {
    if (url) {
      PresentationApi.get(url)
        .then(async (fetchedManifest: IManifestData) => {
          const grpManifest = buildManifest(fetchedManifest);
          const yearsArr = Object.keys(grpManifest);
          const yRange = stringToNumberArray(yearRange);
          const isYearRangeSet =
            yRange &&
            yRange.length === 2 &&
            yearsArr.includes(yRange[0].toString()) &&
            yearsArr.includes(yRange[1].toString()) &&
            yRange[0] <= yRange[1];

          setYearsArray(yearsArr);

          if (!isYearRangeSet) {
            setYearsFilter([
              Number(yearsArr[0]),
              Number(yearsArr[yearsArr.length - 1]),
            ]);
          } else {
            setYearsFilter(yRange);
          }

          if (query !== '') {
            onSubmit();
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

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
    // Define filter query array and search parameters
    const fq = [];
    const params = {
      ...queryParams,
      q: query,
      fl: defaultQueryParams.fl,
    };

    // If event exists, prevent form submission and update history
    if (evt) {
      evt.preventDefault();
      history.push(replaceSearchParameters({ q: query, page: null }));
    }

    // If the query is not a Solr expert query, append fuzzy filter
    if (!isSolrExpertQuery(query)) {
      // wrap each word in query in ~fuzzyFilter
      params.q = query
        .split(' ')
        .map((word) => `${word}~${fuzzyFilter}`)
        .join(' ');
      setFuzzy(fuzzyFilter.toString());
    } else {
      params.q = query;
    }

    // If there's only one source, append it to filter query
    if (Array.isArray(sources) && sources.length === 1) {
      fq.push(`source:${sources[0]}`);
    }

    // If valid year filter range is provided, append it to filter query
    if (
      Array.isArray(yearsFilter) &&
      yearsFilter[0] <= yearsFilter[1] &&
      numberArrayToString(yearsFilter) !== '0,0'
    ) {
      const from = `${yearsFilter[0]}-01-01T00:00:00Z`;
      const to = `${yearsFilter[1]}-12-31T23:59:59Z`;

      fq.push(`date:[${from} TO ${to}]`);
      setYearRange(numberArrayToString(yearsFilter));
    }

    // If filter query array is populated, add it to search parameters
    if (fq.length > 0) {
      params.fq = fq.join(' AND ');
    }

    // If start isn't default (0), add it to search parameters
    if (start !== '0') {
      params.start = start;
    }

    // Handle frequency sort parameter
    if (sort === 'frequency') {
      const termfrequency = `termfreq(ocr_text,'${query}')`;

      // If query is sortable by frequency, set sort parameters
      if (isSolrFrequencySortable(query)) {
        params.fl = `${defaultQueryParams.fl},freq:${termfrequency}`;
        params.sort = `${termfrequency} desc`;
      } else {
        delete params.sort;
        setSort(null);
      }
    } else if (!['relevance'].includes(sort)) {
      // Handle other sorts
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
              <div className="search-form-fuzzy">
                <span className="search-form-fuzzy-label">{`${t(
                  'searchAdvancedFuzzyFrom'
                )}`}</span>
                <Slider
                  key={fuzzy}
                  defaultValue={Number(fuzzy)}
                  onChangeCommitted={(ev: any, newValue: number | number[]) =>
                    setFuzzyFilter(newValue as number)
                  }
                  min={0}
                  max={2}
                  step={1}
                  size="small"
                  disabled={isSolrExpertQuery(query)}
                />
                <span className="search-form-fuzzy-label">
                  {t('searchAdvancedFuzzyTo')}
                </span>
                <Tooltip
                  className="search-form-tooltip"
                  title={
                    <div
                      dangerouslySetInnerHTML={{
                        // eslint-disable-line react/no-danger
                        __html: DOMPurify.sanitize(
                          `${t('searchAdvancedFuzzyTooltip')}`
                        ),
                      }}
                    />
                  }
                />
              </div>
              <div className="search-form-years">
                {yearsArray && (
                  <>
                    <label>{t('searchAdvancedYears')}</label>
                    <div className="search-form-years-wrap">
                      <RangeSlider
                        marks={yearsArray.map((value: string) => ({
                          value: parseInt(value),
                        }))}
                        value={yearsFilter}
                        setValue={(value) => setYearsFilter(value)}
                        min={parseInt(yearsArray[0])}
                        max={parseInt(yearsArray[yearsArray.length - 1])}
                        valueLabelDisplay="on"
                        size="small"
                      />
                    </div>
                  </>
                )}
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
                <Link to={query && `?q=${query}`}>
                  <>
                    <CancelIcon /> <span>{t(`searchAdvancedClose`)}</span>
                  </>
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

export default withRouter(SearchFormAdvanced);
