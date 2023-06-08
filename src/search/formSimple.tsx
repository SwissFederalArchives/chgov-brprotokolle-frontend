import React, { Dispatch, SetStateAction } from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
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
    queryParams: ISolrRequest,
    setQueryParams: (qp: ISolrRequest) => void,
    searchResults: ISearchResults | undefined,
    setSearchResults: (sr: ISearchResults) => void,
    sort: string,
    setSort: Dispatch<SetStateAction<string | null>>,
    errors: string[],
    setErrors: (e: string[]) => void,
}

interface IState {
    query: string,
    isSearchPending: boolean,
    sources: string[],
}

class SearchFormSimple extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        const queryParams = Object.fromEntries(new URLSearchParams(props.location.search));

        this.state = {
            query: queryParams.q || '',
            isSearchPending: false,
            sources: ['gbooks', 'lunion'],
        };
    }

    abortController: AbortController | null = null;
    defaultQueryParams: ISolrRequest = global.config.getSolrFieldConfig();

    componentDidMount() {
        if (this.state.query !== '') {
            this.onSubmit();
        }
    }

    componentDidUpdate(prevProps: IProps, prevState: IState) {
        const queryIsSet = this.state.query || (prevState.query !== this.state.query && prevState.query !== '');
        const queryParamsChanges = JSON.stringify(prevProps.queryParams) !== JSON.stringify(this.props.queryParams);

        if (queryIsSet && queryParamsChanges) {
            this.onSubmit();
        }
    }

    onSubmit(evt?: React.SyntheticEvent) {
        const { sources, query } = this.state;
        const { queryParams, history, setQueryParams, setSearchResults, errors, setErrors, sort, setSort } = this.props;
        const trimmedQuery = query.trim();
        const start = queryParams?.start || '1';
        const fq = [];
        if (query === '') {
            evt?.preventDefault();
            return;
        }
        if (evt) {
            evt.preventDefault();
            history.push(replaceSearchParameters({ q: query, page: null }));
        }
        const params = {
            ...queryParams,
            q: query,
            fl: this.defaultQueryParams.fl
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
            const termfrequency = `termfreq(ocr_text,'${trimmedQuery}')`

            if (isSolrFrequencySortable(trimmedQuery)) {
                params.fl = `${this.defaultQueryParams.fl},freq:${termfrequency}`;
                params.sort = `${termfrequency} desc`;
            } else {
                delete (params.sort);
                setSort(null);
            }
        } else if (!['relevance'].includes(sort)) {
            params.sort = sort;
        } else {
            delete (params.sort);
            setSort(null);
        }

        this.setState({
            isSearchPending: true
        });

        setQueryParams(params);

        // abort previous request
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        this.abortController = new AbortController();

        fetch(`${process.env.REACT_APP_SOLR_API_BASE}?${new URLSearchParams(params)}`, { signal: this.abortController?.signal })
            .then((resp) => resp.json())
            .then((data: ISearchResults) => {
                this.setState({ isSearchPending: false })
                setSearchResults(data);
                setErrors([]);
            })
            .catch((err) => {
                this.setState({ isSearchPending: false });
                setSearchResults(undefined as any);
                setErrors([...errors, err?.name || '400BadSolrRequest']);
            });
    }

    render() {
        const {
            isSearchPending,
            sources,
            query,
        } = this.state;

        const {
            searchResults,
            queryParams
        } = this.props

        return (
            <Translation ns="common">
                {(t) => (
                    <>
                        <form className="search-form" onSubmit={this.onSubmit.bind(this)}>
                            <div className="search-form-inner search-form-inner--advanced">
                                <div className="search-form-input">
                                    <label>{t('searchAdvancedInputLabel')}</label>
                                    <div className="search-form-input-wrap">
                                        <div className="search-form-input-inner">
                                            <input type="text" className={`form-control ${this.props.errors.find((err) => err === '400BadSolrRequest') ? 'is-invalid' : ''}`} disabled={isSearchPending || sources.length === 0} value={query} onChange={(ev) => this.setState({ query: ev.currentTarget.value })} ></input>
                                            <div className="mdc-linear-progress-wrap">
                                                {isSearchPending && <LinearProgress className="mdc-linear-progress" />}
                                            </div>
                                        </div>
                                        <Tooltip
                                            className="search-form-tooltip"
                                            title={
                                                <div dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
                                                    __html: DOMPurify.sanitize(`${t('searchAdvancedInputTooltip')}`)
                                                }} />
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="search-form-controls">
                                    <button type="submit" className="btn btn-primary" disabled={query === ''}>{t('searchAdvancedButton')}</button>
                                </div>
                            </div>
                            <div className="search-form-info">
                                <p className="mdc-typography search-form-info__link">
                                    <Link to={`?searchMode=advanced${query && `&q=${query}`}`}>
                                        {t(`searchAdvancedOpen`)}
                                    </Link>
                                </p>
                                {(!isSearchPending && searchResults && queryParams.q) && (
                                    <p className="mdc-typography search-form-info__text"
                                        dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
                                            __html: DOMPurify.sanitize(`${t('searchFormFoundMatches', {
                                                numFound: searchResults?.response?.numFound,
                                                q: this.state.query,
                                                QTime: searchResults?.responseHeader?.QTime,
                                            })}`)
                                        }}
                                    />
                                )}
                            </div>
                        </form>
                    </>
                )}
            </Translation>
        )
    }
}

export default withRouter(SearchFormSimple);
