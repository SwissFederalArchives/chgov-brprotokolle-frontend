import * as React from 'react';
import { Translation } from "react-i18next";

const logo = require('../images/logo-CH.svg').default;

require('./footer.css');

class FederationFooter extends React.Component<any> {
    render() {
        return (
            <Translation ns="common">
                {(t) => (
                    <div className="mod_federation-footer">
                        <footer>
                            <div className="container-fluid footer-service">
                                <h3>{t('footerTitle')}</h3>
                            </div>
                            <div className="container-fluid">
                                <hr className="footer-line visible-xs" />
                                <img className="visible-xs" alt='back to home' src={logo} />
                            </div>

                            <div className="footer-address">
                                <span className="hidden-xs">{t('footerTitle')}</span>
                                <nav className="pull-right">
                                    <ul>
                                        <li><a href={`${t('footerTermsAndConditionsLink')}`}>{t('footerTermsAndConditionsLabel')}</a></li>
                                        <li><a href={`${t('footerContactLink')}`}>{t('footerContactLabel')}</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </footer>
                    </div>
                )}
            </Translation>
        );
    }
}

export default FederationFooter;