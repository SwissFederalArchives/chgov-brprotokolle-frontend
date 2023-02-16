import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import moment from 'moment';
import { IManifestReference } from 'interface/IManifestData';

interface IManifestReferenceByMonth {
    [key: string]: IManifestReference
}

interface IProps {
    year: string,
    selectedYear: string|undefined,
    selectedMonth: string|undefined,
    manifestsByMonth: IManifestReferenceByMonth[]
}

const TimelineCalendar = function (props: IProps) {
    const { year, selectedMonth, selectedYear, manifestsByMonth } = props;
    const allMonths = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    let rowRef: any | undefined = undefined;

    useEffect(() => {
        if (rowRef && selectedMonth && year === selectedYear) {
           if (typeof rowRef.scrollIntoView === 'function') {
                rowRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                })
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowRef])

    return (
        <tr 
            className="aiii-timeline-calendar"
            ref={(r) => {
                rowRef = r;
                return true;
            }}
        >
            <th className="aiii-timeline-calendar__year">{year}</th>
            {allMonths.map((month: string) => {
                const monthHasItems = (manifestsByMonth && manifestsByMonth[month]) || false;
                return (
                    <td className="aiii-timeline-calendar__month text-center" key={month}>
                        {
                            monthHasItems
                                ? (<Link
                                    className={(month === selectedMonth && year === selectedYear) ? 'is-selected' : ''}
                                    to={location => {
                                        const queryParams = new URLSearchParams(location.search || '');
                                        queryParams.set('year', year);
                                        queryParams.set('month', month);
                                        return { ...location, search: decodeURIComponent(queryParams.toString())}
                                    }}>{moment().month(month).format('MMM')}</Link>
                                )
                                : (<span>{moment().month(month).format('MMM')}</span>)
                        }
                    </td>
                )
            })}
        </tr>          
    );
};

export default TimelineCalendar;