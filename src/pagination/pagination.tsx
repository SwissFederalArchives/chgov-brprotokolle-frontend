import React from 'react';
import { Translation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './pagination.css';
import { UsePaginationProps, usePagination } from '@material-ui/lab';

interface IProps extends UsePaginationProps {
    rowsPerPage: number,
    numFound: number,
    scrollToRefOnClick?: React.RefObject<HTMLElement>,
}

const getPageUrl = (page: number) => {
    const { pathname, searchParams } = new URL(window.location.href);
    searchParams.set('page', page.toString());
    return `${pathname}?${searchParams.toString()}`;
};

const PaginationLink = (props: any) => {
    const { item, scrollToRefOnClick, children, ...other } = props;
    const clickEvent = () => {
        if (scrollToRefOnClick) {
            scrollToRefOnClick.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Link to={getPageUrl(item.page)} aria-disabled={item.disabled} style={item.disabled ? { pointerEvents: 'none' } : undefined} {...other} onClick={clickEvent}>
            {children}
        </Link>);
};

const Pagination = (props: IProps) => {
    const { rowsPerPage, numFound, page = 1, count = 1, scrollToRefOnClick, ...otherPaginationProps } = props;

    // Needed to retrieve correct numeration of results (for labels)
    const start = (page * rowsPerPage) - (rowsPerPage - 1);
    const end = Math.min(page * rowsPerPage, numFound);
    const total = numFound;

    const { items } = usePagination({ page, count, ...otherPaginationProps });

    return (
        <Translation ns="common">
            {(t) => (
                <nav className="pagination-container clearfix">
                    <span className="pull-left">{t('paginationResults', { start, end, total })}</span>
                    <ul className="pull-right pagination">
                        {items.map((item, index) => {
                            let itemToRender = null;

                            switch (item.type) {
                                case 'first':
                                    itemToRender = <li className={`separator ${item.disabled && 'disabled'}`}>
                                        <PaginationLink item={item} title={t('paginationFirstPage')} scrollToRefOnClick={scrollToRefOnClick}>
                                            <span className="icon icon--step-backward"></span>
                                            <span className="sr-only">{t('paginationFirstPage')}</span>
                                        </PaginationLink>
                                    </li>
                                    break;
                                case 'previous':
                                    itemToRender = <li className={`separator ${item.disabled && 'disabled'}`}>
                                        <PaginationLink item={item} title={t('paginationBack')} scrollToRefOnClick={scrollToRefOnClick}>{t('paginationBack')}</PaginationLink>
                                    </li>
                                    break;
                                case 'start-ellipsis':
                                case 'end-ellipsis':
                                    itemToRender = <li>...</li>;
                                    break;
                                case 'page':
                                    itemToRender = <li className={`${item.selected ? 'active' : ''}`}>
                                        <PaginationLink item={item} scrollToRefOnClick={scrollToRefOnClick}>{item.page} {item.selected && <span className="sr-only">{t('paginationCurrent')}</span>}</PaginationLink>
                                    </li>
                                    break;
                                case 'next':
                                    itemToRender = <li className={`separator-left ${item.disabled && 'disabled'}`}>
                                        <PaginationLink item={item} title={t('paginationForward')} scrollToRefOnClick={scrollToRefOnClick}>{t('paginationForward')}</PaginationLink>
                                    </li>
                                    break;
                                case 'last':
                                    itemToRender = <li className={`separator-left ${item.disabled && 'disabled'}`}>
                                        <PaginationLink item={item} title={t('paginationLast')} scrollToRefOnClick={scrollToRefOnClick}>
                                            <span className="icon icon--step-forward"></span>
                                            <span className="sr-only">{t('paginationLast')}</span>
                                        </PaginationLink>
                                    </li>
                                    break;
                            }

                            return <React.Fragment key={index}>{itemToRender}</React.Fragment>;
                        })}
                    </ul>
                </nav>
            )}
        </Translation>
    );
}

export default Pagination;