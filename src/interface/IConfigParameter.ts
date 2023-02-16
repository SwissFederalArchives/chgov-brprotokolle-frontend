import { ISolrRequest } from "./IOcrSearchData";

export default interface IConfigParameter {
    id: string;
    language?: string;
    manifest?: string;
    disableSharing?: boolean;
    lazyTree?: boolean;
    disableDownload?: boolean;
    disableLanguageSelection?: boolean;
    hideUnbranchedTrees?: boolean;
    externalSearchUrl?: string;
    allowedOrigins?: string | string[];
    overviewYearSliderDefaultRange?: number[];
    solrFieldConfig: ISolrRequest,
    fuzzySearchDefault?: '0' | '1' | '2';
}

