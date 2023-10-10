import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Translation } from 'react-i18next';
import * as DOMPurify from 'dompurify';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { FormControl, FormControlLabel, LinearProgress, Radio, RadioGroup, Slider, Stack } from '@mui/material';

import PresentationApi from '../fetch/PresentationApi';
import IManifestData from '../interface/IManifestData';

import Tooltip from '../tooltip/tooltip';
import RangeSlider from '../rangeSlider/rangeSlider';

import { isSolrExpertQuery } from '../util/solr';
import { buildManifest } from '../timeline/util';

import { SEARCH_FIELD_DECISION_NUMBER, SEARCH_FIELD_MARGINALIA } from './search';

import Config from '../lib/Config';

declare let global: {
  config: Config;
};

interface IProps {
  errors: string[];
  fetching: boolean;
  resultsInfo: {
    numFound: number;
    query: string;
    time: string;
  } | null;
  initialValues: any;
  onSubmit: (qp: any) => void;
}

const SearchFormAdvanced = (props: IProps) => {
  const { errors, fetching, initialValues, resultsInfo, onSubmit } = props;
  const [query, setQuery] = useState<string>(initialValues.query);
  const [internalQuery, setInternalQuery] = useState<string>(initialValues.query);
  const [fuzzy, setFuzzy] = useState<number>(initialValues.fuzzy);
  const [searchField, setSearchField] = useState<string>(initialValues.searchField);
  const [yearRange, setYearRange] = useState<number[]>(initialValues.yearRange);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const selectableYearRange = global.config.getSelectableYearRangeBySearchMode()?.[searchField];

  const handleSubmit = (e?: SyntheticEvent) => {
    e?.preventDefault();

    if (query === '') {
      return;
    }

    setInternalQuery(query);

    onSubmit({
      query,
      fuzzy,
      searchField,
      yearRange,
    });
  };

  const fetchAvailableYears = () => {
    PresentationApi.get(process.env.REACT_APP_DEFAULT_COLLECTION_MANIFEST)
      .then(async (fetchedManifest: IManifestData) => {
        const grpManifest = buildManifest(fetchedManifest);
        const yearsArr = Object.keys(grpManifest).map((year) => Number(year));
        const isYearRangeSet =
          yearRange &&
          yearRange.length === 2 &&
          yearsArr.includes(yearRange[0]) &&
          yearsArr.includes(yearRange[1]) &&
          yearRange[0] <= yearRange[1];

        setAvailableYears(yearsArr);

        if (!isYearRangeSet) {
          setYearRange([yearsArr[0], yearsArr[yearsArr.length - 1]]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchAvailableYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Translation ns="common">
      {(t) => (
        <>
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-form-inner search-form-inner--advanced">
              <div className="search-form-input">
                <label>{t('searchAdvancedInputLabel')}</label>
                <div className="search-form-input-wrap">
                  <div className="search-form-input-inner">
                    <input
                      type="text"
                      className={`form-control ${errors.find((err) => err === 'SyntaxError') ? 'is-invalid' : ''}`}
                      disabled={fetching}
                      value={internalQuery}
                      onChange={(ev) => {
                        setQuery(ev.currentTarget.value.trim());
                        setInternalQuery(ev.currentTarget.value);
                      }}
                    ></input>
                    <div className="mdc-linear-progress-wrap">
                      {fetching && <LinearProgress className="mdc-linear-progress" />}
                    </div>
                  </div>
                  <Tooltip
                    className="search-form-tooltip"
                    title={
                      <div
                        dangerouslySetInnerHTML={{
                          // eslint-disable-line react/no-danger
                          __html: DOMPurify.sanitize(`${t('searchAdvancedInputTooltip')}`),
                        }}
                      />
                    }
                  />
                </div>
              </div>
              <div className="search-form-fuzzy">
                <span className="search-form-fuzzy-label">{`${t('searchAdvancedFuzzyFrom')}`}</span>
                <Slider
                  key={fuzzy}
                  defaultValue={Number(fuzzy)}
                  onChangeCommitted={(ev: any, newValue: number | number[]) => setFuzzy(newValue as number)}
                  min={0}
                  max={2}
                  step={1}
                  size="small"
                  disabled={isSolrExpertQuery(query)}
                />
                <span className="search-form-fuzzy-label">{t('searchAdvancedFuzzyTo')}</span>
                <Tooltip
                  className="search-form-tooltip"
                  title={
                    <div
                      dangerouslySetInnerHTML={{
                        // eslint-disable-line react/no-danger
                        __html: DOMPurify.sanitize(`${t('searchAdvancedFuzzyTooltip')}`),
                      }}
                    />
                  }
                />
              </div>
              <div className="search-form-mode">
                <label>{t('searchAdvancedMode')}</label>
                <FormControl sx={{ mt: -0.8 }}>
                  <RadioGroup
                    aria-labelledby="search-form-mode-label"
                    value={searchField}
                    name="textField"
                    onChange={(ev, newValue) => setSearchField(newValue)}
                  >
                    <FormControlLabel
                      value="ocr_text"
                      control={<Radio />}
                      label={t('searchAdvancedModeFullText')}
                      sx={{ mb: -1 }}
                    />
                    <FormControlLabel
                      value={SEARCH_FIELD_MARGINALIA}
                      control={<Radio />}
                      label={
                        <Stack direction="row" spacing={1.5}>
                          <span>{t('searchAdvancedModeMarginalia')}</span>
                          <Tooltip
                            className="search-form-tooltip"
                            title={
                              <div
                                dangerouslySetInnerHTML={{
                                  // eslint-disable-line react/no-danger
                                  __html: DOMPurify.sanitize(`${t('searchAdvancedModeMarginaliaTooltip')}`),
                                }}
                              />
                            }
                          />
                        </Stack>
                      }
                      sx={{ mb: -1 }}
                    />
                    <FormControlLabel
                      value={SEARCH_FIELD_DECISION_NUMBER}
                      control={<Radio />}
                      label={
                        <Stack direction="row" spacing={1.5}>
                          <span>{t('searchAdvancedModeDecisionNumber')}</span>
                          <Tooltip
                            className="search-form-tooltip"
                            title={
                              <div
                                dangerouslySetInnerHTML={{
                                  // eslint-disable-line react/no-danger
                                  __html: DOMPurify.sanitize(`${t('searchAdvancedModeDecisionNumberTooltip')}`),
                                }}
                              />
                            }
                          />
                        </Stack>
                      }
                      sx={{ mb: -1 }}
                    />
                  </RadioGroup>
                </FormControl>
              </div>
              <div className="search-form-years">
                {availableYears.length > 0 && (
                  <>
                    <label>{t('searchAdvancedYears')}</label>
                    <div className="search-form-years-wrap">
                      <RangeSlider
                        key={searchField}
                        marks={availableYears.map((value: number) => ({
                          value,
                        }))}
                        value={yearRange}
                        setValue={(value) => setYearRange(value)}
                        min={availableYears[0]}
                        max={availableYears[availableYears.length - 1]}
                        minSelectable={selectableYearRange?.[0]}
                        maxSelectable={selectableYearRange?.[1]}
                        valueLabelDisplay="on"
                        size="small"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="search-form-controls">
                <button type="submit" className="btn btn-primary" disabled={query === ''}>
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
              {!fetching && resultsInfo && (
                <p
                  className="mdc-typography search-form-info__text"
                  dangerouslySetInnerHTML={{
                    // eslint-disable-line react/no-danger
                    __html: DOMPurify.sanitize(
                      `${t('searchFormFoundMatches', {
                        numFound: resultsInfo.numFound,
                        q: resultsInfo.query,
                        QTime: resultsInfo.time,
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

export default SearchFormAdvanced;
