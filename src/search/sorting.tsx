import React from 'react';
import i18next from 'i18next';
import { useLocation } from 'react-router-dom';
import Config from '../lib/Config';
import { isSolrFrequencySortable } from '../util/solr';
import './search.css';

declare let global: {
    config: Config;
};

interface IProps {
    rows: number,
    setRows: React.Dispatch<React.SetStateAction<string | null>>,
    sort: string,
    setSort: React.Dispatch<React.SetStateAction<string | null>>,
}

const SearchSorting = (props: IProps) => {
    const { rows, setRows, sort, setSort } = props;
    const availableRows = global.config.getAvailableSearchRows();
    const availableSorts = global.config.getAvailableSearchSorts();
    const location = useLocation();
    const query = Object.fromEntries(new URLSearchParams(location.search))?.q || '';

    return (
        <div className='simple-filters'>
            <div className="simple-filters__rows">
                <div className="simple-filters__row simple-filters__row--left">
                    <label>{i18next.t('searchFormOrderBy')}</label>
                    <select className="form-control" value={sort} onChange={(ev) => setSort(ev.currentTarget.value)}>
                        {availableSorts.map((value) => {
                            const disabled = value === 'frequency' && !isSolrFrequencySortable(query);
                            return <option key={value} value={value} disabled={disabled}>{i18next.t(`searchFormOrderBy_${value}`)}</option>
                        })}
                    </select>
                </div>
                <div className="simple-filters__row simple-filters__row--right">
                    <label>{i18next.t('searchFormRowsPerPage')}</label>
                    <select className="form-control" value={rows} onChange={(ev) => setRows(ev.currentTarget.value)}>
                        {availableRows.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default SearchSorting;