
const SOLR_ESCAPE_CHAR = '\\';

const SOLR_WHITESPACE_CHARS = [' ', '%20'];

const SOLR_SPECIAL_CHARS = [
    '+',            // Requires that the following term be present.
    '-',            // Prohibits the following term (that is, matches on fields or documents that do not include that term). The - operator is functionally similar to the Boolean operator !. Because it’s used by popular search engines such as Google, it may be more familiar to some user communities.
    '&&', 'AND',    // Requires both terms on either side of the Boolean operator to be present for a match.
    '||', 'OR',     // Requires that either term (or both terms) be present for a match.
    '!',            // Requires that the following term not be present.
    '(', ')',       // Grouping Terms to Form Sub-Queries
    '{', '}',       // Grouping Terms to Form Sub-Queries: Curly brackets { & } denote an exclusive range query that matches values between the upper and lower bounds, but excluding the upper and lower bounds themselves.
    '[', ']',       // Grouping Terms to Form Sub-Queries: Square brackets [ & ] denote an inclusive range query that matches values including the upper and lower bound.
    '^',            // Boosting a Term
    '"',            // Phrase Search
    '~',            // Fuzzy Search
    '*',            // Multiple characters (matches zero or more sequential characters)
    '?',            // Single character (matches a single character)
    ':',            // Field Search
];

/**
 * Detects if at least one, unescaped special character is in query
 * 
 * @param query 
 * @returns { boolean }
 */
export function isSolrExpertQuery(query: string): boolean {
    return SOLR_SPECIAL_CHARS.some((char) => query.includes(char) && query.charAt(query.indexOf(char) - 1) !== SOLR_ESCAPE_CHAR);
}

/**
 * Detects whether a query allows sorting by frequency
 */
export function isSolrFrequencySortable(query: string): boolean {
    return !(isSolrExpertQuery(query) || SOLR_WHITESPACE_CHARS.some((char) => query.includes(char)));
}