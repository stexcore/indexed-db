/***************************************************************
    Authors : Steven Aray - Sunday, December 12, 2024
    Website : https://stexcore.com
    Lib: indexed-db
    Copyright 2024
***************************************************************/

import { ISearchOptions } from "./search.options";

/**
 * interface to manage a table indexedDB
 */
export interface ITable<
    /**
     * Type of recods
     */
    T extends { [key: string]: any }, 

    /**
     * Type to insert/update recods
     */
    T2 extends { [key: string]: any }
> {
    /**
     * Table name
     */
    readonly table_name: string;

    /**
     * Find all records based on the search options
     * @param searchOptions Options to search
     * @returns Records found
     */
    findAll(searchOptions?: ISearchOptions<T>): Promise<T[]>;

    /**
     * Delete all records based on the search options
     * @param searchOptions Options to search
     * @returns Count recods deleted
     */
    delete(searchOptions?: ISearchOptions<T>): Promise<{ n_affected: number }>;

    /**
     * Update all records based on the search options
     * @param data Data to update
     * @param searchOptions Options to search
     * @returns Count recods updated
     */
    update(data: { [key in keyof T2]?: T2[key] }, searchOptions?: ISearchOptions<T>): Promise<{ n_affected: number }>;

    /**
     * Get count of all records based on the search options
     * @param searchOptions Options to search
     * @returns Count records
     */
    count(searchOptions?: ISearchOptions<T>): Promise<number>;

    /**
     * Insert one or more records
     * @param value Record or Array of reccods
     * @returns Recods inserted
     */
    insert<T3 extends T2 | T2[]>(value: T3 extends T2 ? T2 : T2[]): Promise<T3 extends T2 ? T : T[]>;
}