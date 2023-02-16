import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Translation } from 'react-i18next';
import Cookie from 'universal-cookie';
import PresentationApi from "../fetch/PresentationApi";
import IManifestData from "../interface/IManifestData";
import ITimelineData from "../interface/ITimelineData";
import RangeSlider from 'rangeSlider/rangeSlider';
import TimelineCalendar from './calendar';
import TimelineResults from './results';
import Config from '../lib/Config';
import { buildManifest, fetchYearsByRange, fetchMonth, filterManifestsByDateRange } from './util';


declare let global: {
    config: Config;
};

require('./timeline.css');

const Timeline = function () {
    const url = process.env.REACT_APP_DEFAULT_COLLECTION_MANIFEST;
    const location = useLocation();
    const cookie = new Cookie();
    const defaultRange = cookie.get('timelineRange') || global.config.getOverviewYearSliderDefaultRange();
    const [manifest, setManifest] = useState<ITimelineData | undefined>(undefined);
    const [filterRange, setFilterRange] = useState<number[]>(defaultRange);
    const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
    const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
    const [yearsArray, setYearsArray] = useState<string[] | undefined>(undefined);

    const filteredManifests: ITimelineData|undefined = filterManifestsByDateRange(manifest, filterRange[0], filterRange[1]);

    // Fetching manifest...
    useEffect(() => {
        if (url) {
            PresentationApi.get(url).then(async (fetchedManifest: IManifestData) => {
                const grpManifest = buildManifest(fetchedManifest);
                setYearsArray(Object.keys(grpManifest));
                setManifest(grpManifest);
            })
        }
    }, [url]);


    // (re)defining filterRange by respecting yearsArray...
    useEffect(() => {
        if (yearsArray && filterRange) {
            const minY = parseInt(yearsArray[0]);
            const maxY = parseInt(yearsArray[yearsArray.length - 1]);
            if (selectedYear && selectedMonth) {
                setFilterRange([Math.max(minY, Math.min(filterRange[0], parseInt(selectedYear))), Math.min(maxY, Math.max(filterRange[1], parseInt(selectedYear)))]);
            } else {
                setFilterRange([Math.max(minY, filterRange[0]), Math.min(maxY, filterRange[1])]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearsArray, selectedYear, selectedMonth])


    // Fetching missing year manifests by filterRange...
    useEffect(() => {
        if (manifest && filterRange) {
            fetchYearsByRange(manifest, filterRange)
                .then((newManifest) => {
                    setManifest(newManifest)
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterRange])

    // (re)defining selectedYear and selectedMonth by listening to URL parameters...
    useEffect(() => {
        const queryParams = Object.fromEntries(new URLSearchParams(location.search));
        setSelectedYear(queryParams.year);
        setSelectedMonth(queryParams.month);
    }, [location])

    // fetching selected month...
    useEffect(() => {
        if (manifest && selectedMonth && selectedYear) {
            const yearExistsInManifest = manifest[selectedYear]?.months && manifest[selectedYear]?.months[selectedMonth] &&  !manifest[selectedYear]?.months[selectedMonth]?.items;
            if (yearExistsInManifest) {
                fetchMonth(manifest, selectedYear, selectedMonth)
                    .then((newManifest) => {
                        if (manifest !== newManifest) {
                            setManifest(newManifest)
                        }
                    })
                    .catch(() => {})
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manifest, selectedMonth, selectedYear])

    return (
        <Translation ns="common">
            {(t) => (
                <>
                    {manifest && yearsArray && (
                        <>
                            <h2>{t('pageOverviewH2')}</h2>
                            <div className="aiiif-timeline-years">
                                <RangeSlider
                                    marks={Object.keys(manifest).map((value: string) => ({ value: parseInt(value) }))}
                                    value={filterRange}
                                    setValue={setFilterRange}
                                    min={parseInt(yearsArray[0])}
                                    max={parseInt(yearsArray[yearsArray.length - 1])}
                                    valueLabelDisplay="on"
                                    size="medium"
                                />
                            </div>
                        </>
                    )}
                    {filteredManifests && (
                        <div className='aiii-timeline-results-container'>
                            <table className="aiii-timeline-results table">
                                <tbody>
                                    {Object.keys(filteredManifests).map((year) => (
                                        <React.Fragment key={year}>
                                            <TimelineCalendar
                                                year={year}
                                                manifestsByMonth={filteredManifests[year].months}
                                                selectedMonth={selectedMonth}
                                                selectedYear={selectedYear}
                                            />
                                            <TimelineResults
                                                year={year}
                                                manifestsByMonth={filteredManifests[year].months}
                                                selectedMonth={selectedMonth}
                                                selectedYear={selectedYear}
                                            />
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </Translation>
    )
};

export default Timeline;