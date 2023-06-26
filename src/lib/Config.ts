import TouchDetection from './TouchDetection';
import IConfigParameter from '../interface/IConfigParameter';
import { ISolrRequest } from '../interface/IOcrSearchData';

class Config {

    private readonly id: string = '';

    private readonly defaultNavBarWidth: number = 300;

    private minimalNavBarWidth: number = 120;

    private readonly language: string;

    private readonly disableSharing: boolean;

    private readonly disableDownload: boolean;

    private readonly disableLanguageSelection: boolean;

    private readonly lazyTree: boolean;

    private readonly hideUnbranchedTrees: boolean;

    private readonly externalSearchUrl?: string;

    private readonly manifest: string;

    private readonly fallbackLanguage: string = 'de';

    private readonly allowedOrigins: string | string[] = '*';

    private readonly htmlViewer: boolean;

    private readonly translations: { [key: string]: string } = {
        de: 'Deutsch',
        fr: 'Français',
        it: 'Italiano',
        en: 'English',
    };

    private readonly overviewYearSliderDefaultRange: number[];

    private readonly fuzzySearchDefault: '0' | '1' | '2';

    private readonly solrFieldConfig: ISolrRequest;

    constructor(config: IConfigParameter) {
        this.id = config.id;
        this.language = config.language ? config.language : window.navigator.language;
        this.manifest = config.manifest ? config.manifest : '';
        this.allowedOrigins = config.allowedOrigins ? config.allowedOrigins : '*';
        this.disableSharing = config.disableSharing ? config.disableSharing : false;
        this.disableDownload = config.disableDownload ? config.disableDownload : false;
        this.disableLanguageSelection = config.disableLanguageSelection ? config.disableLanguageSelection : false;
        this.lazyTree = config.lazyTree ? config.lazyTree : false;
        this.hideUnbranchedTrees = config.hideUnbranchedTrees ? config.hideUnbranchedTrees : false;
        this.externalSearchUrl = config.externalSearchUrl;
        this.htmlViewer = config.htmlViewer ?? false;
        this.overviewYearSliderDefaultRange = config.overviewYearSliderDefaultRange ? config.overviewYearSliderDefaultRange : [1874, 1900];
        this.fuzzySearchDefault = config.fuzzySearchDefault ? config.fuzzySearchDefault : '0';
        this.solrFieldConfig = config.solrFieldConfig ? config.solrFieldConfig : {
            'q': '',
            'fl': 'id,source,title,date',
            'qf': 'title^20.0 subtitle^16.0 $SEARCHFIELD$^0.3',
            'df': '$SEARCHFIELD$',
            'hl': 'on',
            'hl.ocr.fl': '$SEARCHFIELD$',
            'hl.snippets': '1',
            'hl.weightMatches': 'true',
            'rows': '25',
            'sort': 'score desc',
        }
    }

    private readonly availableSearchRows: number[] = [10, 25, 50, 100];
    private readonly availableSearchSorts: string[] = ['score desc', 'date asc', 'date desc', 'frequency'];
    private readonly selectableYearRangeBySearchMode = {
        'marginalia_text': [1848, 1903],
        'decision_number': [1848, 1903],
    };

    getSplitterWidth(folded: boolean) {

        if (TouchDetection.isTouchDevice()) {
            if (folded) {
                return 0;
            }

            return 16;
        }

        return 8;
    }

    getDefaultNavBarWith() {
        return this.defaultNavBarWidth;
    }

    getMinimalNavBarWidth() {
        return this.minimalNavBarWidth;
    }

    getLanguage() {

        if (Object.keys(this.translations).includes(this.language)) {
            return this.language;
        }

        if (Object.keys(this.translations).includes(this.language.substr(0, 2))) {
            return this.language.substr(0, 2)
        }

        return this.fallbackLanguage;
    }

    getFallbackLanguage() {
        return this.fallbackLanguage;
    }

    getTranslations() {
        return this.translations;
    }

    getManifest() {
        return this.manifest;
    }

    getDisableSharing() {
        return this.disableSharing;
    }

    getDisableDownload() {
        return this.disableDownload;
    }

    getDisableLanguageSelection() {
        return this.disableLanguageSelection;
    }

    getLazyTree() {
        return this.lazyTree;
    }

    getHideUnbranchedTrees() {
        return this.hideUnbranchedTrees;
    }

    getExternalSearchUrl() {
        return this.externalSearchUrl;
    }

    isAllowedOrigin(url: string): boolean {
        if (this.allowedOrigins === '*') {
            return true;
        }

        if (!Array.isArray(this.allowedOrigins)) {
            return url.startsWith(this.allowedOrigins);
        }

        for (const allowedOrigin of this.allowedOrigins) {
            if (url.startsWith(allowedOrigin)) {
                return true;
            }
        }

        return false;
    }

    getID() {
        return this.id;
    }

    getHtmlViewer() {
        return this.htmlViewer;
    }

    getOverviewYearSliderDefaultRange() {
        return this.overviewYearSliderDefaultRange;
    }

    getSelectableYearRangeBySearchMode() {
        return this.selectableYearRangeBySearchMode;
    }

    getSolrFieldConfig() {
        return this.solrFieldConfig;
    }

    getFuzzySearchDefault() {
        return this.fuzzySearchDefault;
    }

    getAvailableSearchRows() {
        return this.availableSearchRows;
    }

    getAvailableSearchSorts() {
        return this.availableSearchSorts;
    }
}

export default Config;
