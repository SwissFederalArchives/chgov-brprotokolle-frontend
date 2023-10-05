import { ISearchHighlightingMode, ISearchResults, ISolrRequest } from '../interface/IOcrSearchData';
import { numberArrayToString } from '../util/misc';
import { isSolrExpertQuery, isSolrFrequencySortable } from '../util/solr';
import { SEARCH_FIELD_FULL_TEXT } from './search';

export const prepareSolrSearchQuery = (
  defaultSolrFieldConfig: ISolrRequest,
  searchMode: 'simple' | 'advanced',
  query = '',
  fuzzy = 0,
  searchField = SEARCH_FIELD_FULL_TEXT,
  yearRange?: number[],
  rows = 25,
  page = 1,
  sort = 'score desc'
) => {
  let fq = [];
  let params = {
    ...defaultSolrFieldConfig,
    rows: String(rows),
  };
  if (query === '') return null;
  
  const realSearchField = searchMode === 'advanced' ? searchField : SEARCH_FIELD_FULL_TEXT;

  // If the query is not a Solr expert query, append fuzzy filter
  if (query && !isSolrExpertQuery(query) && fuzzy > 0) {
    // wrap each word in query in ~fuzzy
    params.q = query
      .split(' ')
      .map((word) => `${word}~${fuzzy}`)
      .join(' ');
  } else {
    params.q = query ?? '';
  }

  if (searchMode === 'advanced') {
    // If valid year filter range is provided, append it to filter query
    if (Array.isArray(yearRange) && yearRange[0] <= yearRange[1] && numberArrayToString(yearRange) !== '0,0') {
      const from = `${yearRange[0]}-01-01T00:00:00Z`;
      const to = `${yearRange[1]}-12-31T23:59:59Z`;

      fq.push(`date:[${from} TO ${to}]`);
    }
    // If filter query array is populated, add it to search parameters
    if (fq.length > 0) {
      params.fq = fq.join(' AND ');
    }

    // If start isn't default (1), add it to search parameters
    if (page !== 1) {
      params.start = String(page);
    }

    // Handle sort parameter
    if (sort === 'frequency') {
      const termfrequency = `termfreq(${realSearchField},'${query}')`;

      // If query is sortable by frequency, set sort parameters
      if (query && isSolrFrequencySortable(query)) {
        params.fl += `,freq:${termfrequency}`;
        params.sort = `${termfrequency} desc`;
      } else {
        delete params.sort;
      }
    } else if (!['relevance'].includes(sort)) {
      // Handle other sorts
      params.sort = sort;
    } else {
      delete params.sort;
    }

    if (realSearchField !== SEARCH_FIELD_FULL_TEXT) {
      delete params['hl.ocr.fl'];
    }
  }

  // Replace $SEARCHFIELD$ with the actual textField in the whole params object
  Object.keys(params).forEach((key) => {
    if (typeof params[key] === 'string') {
      params[key] = params[key].replace(/\$SEARCHFIELD\$/g, realSearchField);
    }
  });

  return params;
};

export const getResultsHighlightingMode = (searchResults: ISearchResults): ISearchHighlightingMode => {
  if (searchResults?.ocrHighlighting) {
    return 'ocr';
  }
  if (searchResults?.highlighting) {
    return 'normal';
  }
  return 'none';
};
