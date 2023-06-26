export interface IHighlightInformation {
    ulx: number,
    uly: number,
    lrx: number,
    lry: number,
    page: string,
    text: string,
    parentRegionIdx: number,
}

export interface IHighlightDocument {
    source: string,
    title: string,
    id: string,
}

export interface IHighlightSnippet {
    regions: IHighlightInformation[],
    text: string,
    highlights: [
        [IHighlightInformation]
    ],
}

export interface IOCRHighlight {
    snippets: IHighlightSnippet[],
    numTotal: string
}

export interface ISearchResults {
    response: {
        numFound: string,
        docs: IHighlightDocument[]
    },
    highlighting: {
        [key: string]: string[]
    },
    ocrHighlighting: {
        [key: string]: {
            ocr_text: IOCRHighlight
        }
    }
    responseHeader: {
        QTime: string
    }
}

export const ISearchResultsType = {
    NORMAL: 'normal',
    OCR: 'ocr',
    NONE: 'none',
} as const;

export type ISearchHighlightingMode = typeof ISearchResultsType[keyof typeof ISearchResultsType];
export interface ISolrRequest {
    'q': string,
    'fl': string,
    'fq'?: string,
    'qf': string,
    'df': string,
    'hl': string,
    'hl.ocr.fl'?: string,
    'hl.fl'?: string,
    'hl.snippets': string,
    'hl.weightMatches': string,
    'rows': string,
    'sort'?:string,
    'start'?: string,
}