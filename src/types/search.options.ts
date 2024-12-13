/***************************************************************
    Authors : Steven Aray - Sunday, December 12, 2024
    Website : https://stexcore.com
    Lib: indexed-db
    Copyright 2024
***************************************************************/

/**
 * Interface used to search fields in indexed db
 */
export interface ISearchOptions<T extends { [key: string]: any }> {
    /**
     * Select recods based fields where
     */
    where?: {
        [key in keyof T]?: T[key] | Array<T[key]>
    },

    /**
     * Limit to apply operation (find/update/delete)
     */
    limit?: number,

    /**
     * Offset index initial to apply operation (find/update/delete)
     */
    offset?: number
}