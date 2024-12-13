/***************************************************************
    Authors : Steven Aray - Sunday, December 12, 2024
    Website : https://stexcore.com
    Lib: indexed-db
    Copyright 2024
***************************************************************/

import { IFieldType } from "./types/field.type";
import { IFieldTypeToValueType } from "./types/field.type.value.type";
import { IStructField } from "./types/struct.field";
import { IStructTable } from "./types/struct.table";
import { ITable } from "./types/table";

/**
 * Make a structure of tables database to manage indexeddb
 * @param struct Structure table
 * @returns Structure table
 */
export function createStructTables<T extends { 
    [key: string]: IStructTable<{ 
        [key: string]: IStructField<IFieldType, boolean | undefined, boolean | undefined> 
    }>
}>(struct: T) {
    return struct;
}


/**
 * Database to manage tables based in IndexedDB
 */
export class IndexedDB<T extends { [key: string]: IStructTable<{ [key: string]: IStructField<IFieldType, boolean | undefined, boolean | undefined> }> }> {

    /**
     * Structure of all tables
     */
    public readonly structs: {

        /**
         * Tables
         */
        [key in keyof T]: {
            /**
             * Name field key with primary key
             */
            primaryKey: keyof T[key],

            /**
             * Fields of table
             */
            fields: T[key]
        }
    };

    /**
     * Promise async getting database
     */
    private gettingDatabase: {
        /**
         * Resolve promise
         * @param db database
         */
        resolve: (db: IDBDatabase) => void,

        /**
         * Reject promise
         * @param err Error instance
         */
        reject: (err: unknown) => void
    }[] = [];

    /**
     * Database instance memory
     */
    private db: IDBDatabase | undefined;
    
    /**
     * Inicialize the structure of database
     * @param database Database name
     * @param table_structs Structure of tables
     */
    constructor(
        /**
         * database name
         */
        public readonly db_name: string, 
        readonly table_structs: T
    ) {
        const struct: any = {};

        // Earch all tables to index the structure fields
        for(const table_name in table_structs) {
            const table = table_structs[table_name];

            let fieldPrimary: string | undefined;

            // Earch fields to validate initial structure
            for(const field_name in table) {
                const field = table[field_name];

                // Validate if exitst athoner primary key
                if(field.primarykey) {
                    if(fieldPrimary) throw new Error("The table '" + table_name + "' has duplicates primary keys: '" + fieldPrimary + "' and '" + field_name + "'")

                    fieldPrimary = field_name;
                }
            }

            // validate if this table does'nt has a primary key
            if(!fieldPrimary) throw new Error("The table '" + table_name + "' does'nt has a field with primary key")
            
            // set to memory the structure table and her primary key
            struct[table_name] = {
                primaryKey: fieldPrimary,
                fields: table_structs[table_name]
            };
        }

        // Save to local memory the structure and hers primary key
        this.structs = struct;
    }

    /**
     * asynchronously obtains the database
     * @returns Indexed Database
     */
    private GetDataBase() {
        return new Promise<IDBDatabase>((_resolve, _reject) => {
            try {
                // If exist in memory, resolve the database
                if(this.db) _resolve(this.db);

                // Append to getting
                this.gettingDatabase.push({
                    resolve: _resolve, 
                    reject: _reject
                });
                
                if(this.gettingDatabase.length > 1) return;

                /**
                 * Resolve all gettings
                 * @param db Database
                 */
                const resolve = (db: IDBDatabase) => {
                    const temp = this.gettingDatabase;
                    this.gettingDatabase = [];

                    temp.forEach((item) => {
                        item.resolve(db);
                    });
                };

                /**
                 * Reject all gettings
                 * @param err Error
                 */
                const reject = (err: unknown) => {
                    const temp = this.gettingDatabase;
                    this.gettingDatabase = [];

                    temp.forEach((item) => {
                        item.reject(err);
                    });
                };
                
                // Get the last version of database
                indexedDB.databases()
                    .then((databases) => {

                        // extract version and open the database
                        const databaseInfo = databases.find(databaseItem => databaseItem.name == this.db_name);
                        const requestOpen = indexedDB.open(this.db_name, (databaseInfo?.version || 0) + 1);
        
                        requestOpen.onsuccess = () => {
                            this.db = requestOpen.result;
                            resolve(requestOpen.result);
                        };
        
                        requestOpen.onerror = () => {
                            reject(requestOpen.error);
                        };
        
                        requestOpen.onupgradeneeded = (ev) => {

                            // earch the structure to create tables in database
                            for(const table_name in this.structs) {
                                const table = this.structs[table_name];
                                const primaryKey = table.fields[table.primaryKey];

                                let objectStore: IDBObjectStore;
                                
                                // if not exists the table, create a new, and set the structure index
                                if(!requestOpen.result.objectStoreNames.contains(table_name)) {
                                    objectStore = requestOpen.result.createObjectStore(table_name, {
                                        autoIncrement: primaryKey.autoincrement!!,
                                        keyPath: table.primaryKey as string
                                    });
                                }
                                else {
                                    objectStore = requestOpen.transaction!.objectStore(table_name);
                                }

                                // earch all fields
                                for(const fieldname in table.fields) {
                                    const field = table.fields[fieldname];

                                    // if not exist the field index, create a new
                                    if(!objectStore.indexNames.contains(fieldname)) {
                                        objectStore.createIndex(fieldname, fieldname, {
                                            unique: !!field.unique
                                        });
                                    }
                                }

                                // search fields to check the index structure that should not exist
                                for(const fieldname of objectStore.indexNames) {
                                    if(!table.fields[fieldname]) {
                                        objectStore.deleteIndex(fieldname);
                                    }
                                }
                            }
                        };
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
            catch(err) {
                _reject(err);
            }
        });
    }

    /**
     * Get a interface to manage a table of indexedDB
     * @param name Name of table
     * @returns Inteface to manage the table
     */
    getTable<T2 extends (keyof T & string)>(name: T2): Promise<ITable<{ [key in keyof T[T2]]: (
        T[T2][key]["allow_null"] extends true ? 
            (IFieldTypeToValueType<T[T2][key]["type"]> | null) :
            (IFieldTypeToValueType<T[T2][key]["type"]>)
    )}, { 
        [key in keyof T[T2] as T[T2][key]["autoincrement"] extends true ? never : key]: (
            T[T2][key]["allow_null"] extends true ? 
                (IFieldTypeToValueType<T[T2][key]["type"]> | null) :
                (IFieldTypeToValueType<T[T2][key]["type"]>)
    )}>> {

        type IValue = { [key in keyof T[T2]]: (
            T[T2][key]["allow_null"] extends true ? 
                (IFieldTypeToValueType<T[T2][key]["type"]> | null) :
                (IFieldTypeToValueType<T[T2][key]["type"]>)
        )};

        type IValueInsert = { 
            [key in keyof T[T2] as T[T2][key]["autoincrement"] extends true ? never : key]: (
                T[T2][key]["allow_null"] extends true ? 
                    (IFieldTypeToValueType<T[T2][key]["type"]> | null) :
                    (IFieldTypeToValueType<T[T2][key]["type"]>)
        )};
        
        return new Promise((resolve, reject) => {
            try {
                // If do'nt exist the table
                if(!this.structs[name]) {
                    throw new Error("Does'nt exist the table '" + String(name) + "'");
                }

                // get the database
                this.GetDataBase()
                    .then((db) => {
                        const structure = this.structs[name];
                        const fields = structure.fields;

                        /**
                         * Validate types and remove fields unused
                         * @param v value incomming
                         * @returns Value with a correct structure
                         */
                        const format = (v: {[key: string]: any}) => {
                            const data: any = {};
                            
                            for(const fieldname in fields) {
                                const fieldItem = fields[fieldname];
                                
                                if((v[fieldname] === undefined || v[fieldname] === null) && fieldItem.allow_null) {
                                    data[fieldname] = null;
                                }
                                else {
                                    let isValid: boolean = true;

                                    switch(fields[fieldname].type) {
                                        case "string":
                                            isValid = typeof v[fieldname] === "string";
                                            break;

                                        case "array":
                                            isValid = v[fieldname] instanceof Array;
                                            break;

                                        case "object":
                                            isValid = v[fieldname]instanceof Object;
                                            break;
                                            
                                        case "boolean":
                                            isValid = typeof v[fieldname] === "boolean";
                                            break;

                                        case "number":
                                            isValid = typeof v[fieldname] === "number";
                                            break;

                                        default:
                                            // TODO: manage objects
                                    }

                                    if(!(fieldItem.autoincrement && fieldItem.primarykey)) {
                                        
                                        if(!isValid) throw new Error("Unexpected type in field '" + fieldname + "'. Type required '" + fieldItem.type + "', type received '" + v[fieldname] + "'");

                                        data[fieldname] = v[fieldname];
                                    }

                                }
                            }

                            return data;
                        }

                        /**
                         * Remove undefineds in a object
                         * @param v value incoming
                         * @returns value without fields undefineds
                         */
                        const removeUndefineds = (v: {[key: string]: any}) => {
                            const data: {[key: string]: any} = {};

                            for(const key in v) {
                                if(v[key] !== undefined) data[key] = v[key];
                            }

                            return data;
                        }
                        
                        /**
                         * Instance table
                         */
                        const table: ITable<IValue, IValueInsert> = {
                            table_name: String(name),

                            // find all reconds
                            findAll: (searchOptions) => {
                                return new Promise((resolve, reject) => {
                                    const transaction = db.transaction(name, "readonly");
                                    const storage = transaction.objectStore(name);
    
                                    // prepare where object
                                    const where: any = searchOptions?.where || {};
                                    const keys = Object.keys(where).sort((a, b) => (
                                        a > b ? 1 : -b
                                    ));

                                    // get all recods
                                    const requestGetAll = storage.getAll();

                                    requestGetAll.onsuccess = () => {

                                        // filter based in where
                                        const filteredRecords = requestGetAll.result.filter(record => {
                                            return keys.every((key) => {
                                                const value = where[key];
                                                const recordValue = record[key];
                                    
                                                // If the search value is an array, checks if the record value is in the array
                                                if (Array.isArray(value)) {
                                                    return value.includes(recordValue);
                                                }
                                    
                                                // If not an array, compare directly
                                                return recordValue === value;
                                            });
                                        });

                                        // trim records based on limit
                                        resolve(filteredRecords.slice(searchOptions?.offset || 0, (searchOptions?.offset || 0) + (searchOptions?.limit ?? filteredRecords.length)));
                                    }

                                    requestGetAll.onerror = () => {
                                        reject(requestGetAll.error);
                                    }
                                });
                            },

                            // insert recods
                            insert: (value) => {
                                return new Promise((resolve, reject) => {
                                    try {
                                        // get objetStorage/table
                                        const objectstorage = db.transaction(name, "readwrite").objectStore(name);

                                        // analize inputs to insert
                                        const dataItem = (value instanceof Array ? value : [value]).map(d => format(d));

                                        Promise.all(dataItem.map(data => {
                                            return new Promise<any>((resolve, reject) => {
                                                try {
                                                    // insert recods
                                                    const requestAdd = objectstorage.add(data);
            
                                                    requestAdd.onsuccess = () => {

                                                        // resolve data with primary key generated
                                                        resolve({
                                                            ...data,
                                                            [structure.primaryKey]: requestAdd.result
                                                        });
                                                    }
            
                                                    requestAdd.onerror = () => {
                                                        reject(requestAdd.error);
                                                    }
                                                }
                                                catch(err) {
                                                    reject(err);
                                                }
                                            });
                                        }))
                                            .then((insertedRegs) => {
                                                // resolve records inserted
                                                resolve(value instanceof Array ? insertedRegs : insertedRegs[0]);
                                            })
                                    }
                                    catch(err) {
                                        reject(err);
                                    }
                                });
                            },

                            delete: (searchOptions) => {
                                return new Promise((resolve, reject) => {
                                    try {
                                        // search recods
                                        table.findAll(searchOptions)
                                            .then((regs) => {
                                                // get objectStorage/table
                                                const objectstorage = db.transaction(name, "readwrite").objectStore(name);

                                                // earch records
                                                Promise.all(regs.map(item => {
                                                    return new Promise<boolean>((resolve, reject) => {
                                                        try {
                                                            // delete recods
                                                            const requestDelete = objectstorage.delete(item[structure.primaryKey] as string | number);

                                                            requestDelete.onsuccess = () => {
                                                                resolve(true)
                                                            };

                                                            requestDelete.onerror = () => {
                                                                console.error(requestDelete.error);
                                                                resolve(false);
                                                            };
                                                        }
                                                        catch(err) {
                                                            reject(err);
                                                        }
                                                    })
                                                })) 
                                                    .then((result) => {

                                                        // resolve counds records deleted
                                                        resolve({
                                                            n_affected: result.reduce((t, v) => t + Number(v), 0)
                                                        });
                                                    })
                                                    .catch(reject);
                                            })
                                            .catch(reject);
                                    }
                                    catch(err) {
                                        reject(err);
                                    }
                                });
                            },

                            update: (update, searchOptions) => {
                                return new Promise((resolve, reject) => {
                                    try {
                                        // search records
                                        table.findAll(searchOptions)
                                            .then((regs) => {
                                                // get objectStorage/table
                                                const objectstorage = db.transaction(name, "readwrite").objectStore(name);
                                                
                                                // earch records
                                                Promise.all(regs.map(item => {
                                                    return new Promise<boolean>((resolve, reject) => {
                                                        try {
                                                            // update record
                                                            const requestDelete = objectstorage.put({
                                                                ...item,
                                                                ...removeUndefineds(update),
                                                                [structure.primaryKey]: item[structure.primaryKey]
                                                            });

                                                            requestDelete.onsuccess = () => {
                                                                resolve(true)
                                                            };

                                                            requestDelete.onerror = () => {
                                                                console.error(requestDelete.error);
                                                                resolve(false);
                                                            };
                                                        }
                                                        catch(err) {
                                                            reject(err);
                                                        }
                                                    })
                                                })) 
                                                    .then((result) => {

                                                        // resolve records resolved
                                                        resolve({
                                                            n_affected: result.reduce((t, v) => t + Number(v), 0)
                                                        });
                                                    })
                                                    .catch(reject);
                                            })
                                            .catch(reject);
                                    }
                                    catch(err) {
                                        reject(err);
                                    }
                                });
                            },

                            count: (searchOptions) => {
                                return new Promise((resolve, reject) => {
                                    try {
                                        // search recods
                                        table.findAll(searchOptions)
                                            .then(regs => {
                                                // resolve length
                                                resolve(regs.length);
                                            })
                                            .catch(reject);
                                    }
                                    catch(err) {
                                        reject(err);
                                    }
                                });
                            }
                        }

                        resolve(table as any);
                    })
                    .catch(reject);
            }
            catch(err) {
                reject(err);
            }
        });
    }
    
}