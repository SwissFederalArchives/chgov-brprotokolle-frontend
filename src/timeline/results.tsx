import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { AnimatePresence, motion } from 'framer-motion';
import { Translation } from 'react-i18next';
import i18next from 'i18next';
import { getLocalized } from "../lib/ManifestHelpers";
import { IManifestReference } from "../interface/IManifestData";
import { getRelevantRenderingItems } from './util';


interface IManifestReferenceByMonth {
    [key: number]: {
        id: string,
        items: IManifestReference[]
    }
}

interface IProps {
    year: string,
    selectedYear: string | undefined,
    selectedMonth: string | undefined,
    manifestsByMonth: IManifestReferenceByMonth | null
}

const TimelineResults = function (props: IProps) {
    const { year, selectedMonth, selectedYear, manifestsByMonth } = props;
    const { language } = i18next
    const isExpanded = year === selectedYear;
    const selectedMonthFetched = manifestsByMonth && (!selectedMonth || Array.isArray(manifestsByMonth[selectedMonth]?.items));

    return (
        <Translation ns="common">
            {(t) => (
            <tr className="aiii-timeline-results">
                <td className="nopadding noborder" colSpan={13}>
                    <AnimatePresence>
                        {isExpanded && selectedMonthFetched && (
                            <motion.div className={`aiii-timeline-results__inner`} initial="collapsed" animate="expanded" exit="collapsed" variants={{
                                expanded: { opacity: 1, height: 'auto' },
                                collapsed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
                            }}>
                                <table className="table table-striped table-bordered nomargin">
                                    <thead>
                                        <tr>
                                            <th>{t('timelineResultsDate')}</th>
                                            <th>{t('timelineResultsTitle')}</th>
                                            <th>{t('timelineResultsArchiveLink')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {manifestsByMonth && Object.keys(manifestsByMonth).map((month) => (
                                            Array.isArray(manifestsByMonth[month].items) && manifestsByMonth[month].items.map((manifest: IManifestReference, i: number) => {
                                                const date = moment(manifest.navDate);
                                                const dateMonth = date.month().toString();
                                                const dateYear = date.year().toString();
                                                const renderingItems = getRelevantRenderingItems(manifest?.rendering, language);
                                                
                                                return (dateYear === selectedYear && dateMonth === selectedMonth) && (
                                                    <tr key={`${manifest.id}_${dateYear}_${dateMonth}_${i}`}>
                                                        <td>{date.format(t('timelineResultsDateFormat'))}</td>
                                                        <td>
                                                            <Link to={`protocol?manifest=${manifest.id}`}>{getLocalized(manifest.label)}</Link>
                                                        </td>
                                                        <td>
                                                            {renderingItems.map((item: any) => (
                                                                <a className="icon icon--after icon--external" key={item.id} href={item.id} target="_blank" rel="noreferrer">{getLocalized(item.label)}</a>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </td>
            </tr>
            )}
        </Translation>
    );
};

export default TimelineResults;