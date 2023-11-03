import React, { useEffect, useState } from 'react';
import i18next from 'i18next';
import Config from '../lib/Config';
import { isSolrFrequencySortable } from '../util/solr';
import './search.css';
import { usePrevious } from '../util/hooks';

declare let global: {
  config: Config;
};

interface IProps {
  searchField: string;
  onSubmit: ({ page, rows, sort }: { page?: number; rows: number; sort: string }) => void;
  query: string;
  initialValues: { rows: number; sort: string };
}

const SearchSorting = (props: IProps) => {
  const { onSubmit, query, initialValues, searchField } = props;
  const availableRows = global.config.getAvailableSearchRows();
  const availableSorts = global.config.getAvailableSearchSorts();
  const [rows, setRows] = useState<number>(initialValues.rows);
  const [sort, setSort] = useState<string>(initialValues.sort);

  const prevRowsSort = usePrevious(JSON.stringify({ rows, sort }));

  const handleSubmit = (page?: number) => {
    onSubmit({
      ...(page && { page }),
      rows,
      sort,
    });
  };

  useEffect(() => {
    if(prevRowsSort) {
      handleSubmit(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ rows, sort })]);

  return (
    <div className="simple-filters">
      <div className="simple-filters__rows">
        <div className="simple-filters__row simple-filters__row--left">
          <label>{i18next.t('searchFormOrderBy')}</label>
          <select className="form-control" value={sort} onChange={(ev) => setSort(ev.currentTarget.value)}>
            {availableSorts.map((value) => {
              const disabled = value === 'frequency' && !isSolrFrequencySortable(query, searchField);
              return (
                <option key={value} value={value} disabled={disabled}>
                  {i18next.t(`searchFormOrderBy_${value}`)}
                </option>
              );
            })}
          </select>
        </div>
        <div className="simple-filters__row simple-filters__row--right">
          <label>{i18next.t('searchFormRowsPerPage')}</label>
          <select className="form-control" value={rows} onChange={(ev) => setRows(Number(ev.currentTarget.value))}>
            {availableRows.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchSorting;
