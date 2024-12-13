/***************************************************************
    Authors : Steven Aray - Sunday, December 12, 2024
    Website : https://stexcore.com
    Lib: indexed-db
    Copyright 2024
***************************************************************/

import { IFieldType } from "./field.type"
import { IStructField } from "./struct.field"

/**
 * Structure table with fields
 */
export type IStructTable<
    /**
     * Structure table
     */
    T extends { 
        [key: string]: IStructField<
            IFieldType, 
            boolean | undefined, 
            boolean | undefined
        > 
    }
> = {
    [key in keyof T]: T[key]
}