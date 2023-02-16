import React from 'react';
import { Translation } from 'react-i18next';
import Timeline from "../timeline/timeline";
import Main from "../main/main";

export default function PageOverview() {
    return (
        <Translation ns="common">
            {(t) => (
                <Main>
                    <>
                        <h1>{t('pageOverviewH1')}</h1>
                        <Timeline />
                    </>
                </Main>
            )}
        </Translation>
    );
}
