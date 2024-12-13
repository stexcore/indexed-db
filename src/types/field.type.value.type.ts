/***************************************************************
    Authors : Steven Aray - Sunday, December 12, 2024
    Website : https://stexcore.com
    Lib: indexed-db
    Copyright 2024
***************************************************************/

import { IFieldType } from "./field.type";

/**
 * Extracts the type/value based on the type of the field
 */
export type IFieldTypeToValueType<T extends IFieldType> = (
    T extends "string" ? string :
    T extends "number" ? number :
    T extends "boolean" ? boolean :
    T extends "object" ? { [key: string]: any } :
    T extends "array" ? any[] :
    T extends "blob" ? Blob :
    T extends { [keyname: string]: IFieldType } ? { [key in keyof T]: IFieldTypeToValueType<T[key]> } :
    T extends Array<infer T2 extends IFieldType> ? IFieldTypeToValueType<T2>[] :
    never
);