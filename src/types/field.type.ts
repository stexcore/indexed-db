/***************************************************************
    Authors : Steven Aray - Sunday, December 12, 2024
    Website : https://stexcore.com
    Lib: indexed-db
    Copyright 2024
***************************************************************/


/**
 * Types validation field
 */
export type IFieldType = 
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "blob"
    | { [keyname: string]: IFieldType }
    | IFieldType[];