import * as React from 'react';
import LanguageSwitcher from './languageSwitcher';
import FederationBreadcrumbs from './breadcrumbs';
import { Translation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navigation from '../navigation/navigation';
import logo from '../images/logo-CH.svg';

require('./header.css');
class FederationHeader extends React.Component<any> {
    render() {
        return (
            <Translation ns="common">
                {(t) => (
                    <>
                        <header>
                            <FederationBreadcrumbs />
                            <section className="nav-services clearfix">
                                <h2 className="sr-only">{t('languageSelection')}</h2>
                                <LanguageSwitcher />
                            </section>
                            <Link to="/" className="brand hidden-xs" title={`${t('logoAlt')}`}>
                                <img alt={`${t('logoAlt')}`} src={logo} />
                                <h1>{t('headerProjectTitle')}<br />
                                {t('headerProjectSubtitle')}</h1>
                            </Link>
                        </header>
                        <Navigation />
                    </>
                )}
            </Translation>
        );
    }
}

export default FederationHeader;
