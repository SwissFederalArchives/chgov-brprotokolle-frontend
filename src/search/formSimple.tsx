import React, { SyntheticEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Translation } from 'react-i18next';
import { LinearProgress } from '@mui/material';
import Tooltip from '../tooltip/tooltip';
import DOMPurify from 'dompurify';

interface IProps {
  errors: string[];
  fetching: boolean;
  resultsInfo?: {
    numFound: number;
    query: string;
    time: string;
  } | null;
  initialValues: any;
  onSubmit: (qp: any) => void;
}

const SearchFormSimple = (props: IProps) => {
  const { errors, fetching, initialValues, resultsInfo, onSubmit } = props;
  const [query, setQuery] = useState<string>(initialValues.query);
  const [internalQuery, setInternalQuery] = useState<string>(initialValues.query);

  const handleSubmit = (e?: SyntheticEvent) => {
    e?.preventDefault();

    if (query === '') {
      return;
    }

    setInternalQuery(query);

    onSubmit({
      query,
    });
  };

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
                      className={`form-control ${
                        errors.find((err) => err === '400BadSolrRequest') ? 'is-invalid' : ''
                      }`}
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
              <div className="search-form-controls">
                <button type="submit" className="btn btn-primary" disabled={query === ''}>
                  {t('searchAdvancedButton')}
                </button>
              </div>
            </div>
            <div className="search-form-info">
              <p className="mdc-typography search-form-info__link">
                <Link to={`?searchMode=advanced${resultsInfo?.query ? `&q=${resultsInfo.query}` : ''}`}>
                  {t(`searchAdvancedOpen`)}
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

export default SearchFormSimple;
