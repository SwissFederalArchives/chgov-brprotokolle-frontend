import { ISolrRequest } from './IOcrSearchData';

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
  htmlViewer?: boolean;
  overviewYearSliderDefaultRange?: number[];
  selectableYearRangeBySearchMode: {
    [key: string]: number[];
  };
  solrFieldConfig: ISolrRequest;
  fuzzySearchDefault?: '0' | '1' | '2';
}
