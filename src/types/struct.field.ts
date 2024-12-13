/***************************************************************
    Authors : Steven Aray - Sunday, December 12, 2024
    Website : https://stexcore.com
    Lib: indexed-db
    Copyright 2024
***************************************************************/

import { IFieldType } from "./field.type";

/**
 * Types validation field
 */
export interface IStructField<
    /**
     * Field Type
     */
    T extends IFieldType, 

    /**
     * allow null
     */
    T2 extends boolean | undefined = undefined, 

    /**
     * autoincrement
     */
    T3 extends boolean | undefined = undefined
> {
    /**
     * flag to field primary key
     */
    primarykey?: boolean,

    /**
     * flag to field unique
     */
    unique?: boolean,

    /**
     * flag to field with autoincrement (works in conjunction with a primary key field)
     */
    autoincrement?: T3,

    /**
     * flag to field is nullable
     */
    allow_null?: T2,

    /**
     * Type value of field
     */
    type: T,
}