
 # indexed-db

 ## Description

This project is a JavaScript library designed to provide a database-like structure for managing data in the browser. It serves as a layer on top of the IndexedDB API, allowing users to interact with data in the form of tables and perform common database operations such as CRUD (Create, Read, Update, Delete) and conditional queries.

The library is built with strong typing to ensure data integrity and validation, making it a robust solution for client-side data management. By abstracting the complexities of IndexedDB, this library aims to simplify the process of working with structured data in JavaScript applications.

 ## Features

 - **CRUD Operations**: Methods for creating, reading, updating, and deleting records:
   - `findOne`
   - `findAll`
   - `insert`
   - `update`
   - `delete`
   - `count`
 
 - **Conditional Queries**: Use `where` to filter records based on specific criteria.
 - **Pagination**: Implement `limit` and `offset` for efficient data retrieval.
 - **Table Schemas**: Define table structures using JavaScript objects, specifying the fields each table can have.
 - **Strong Typing**: Validate data types to minimize runtime errors.

 ## Getting Started

 To get started with this library, follow these steps:

 ### Prerequisites

 Make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

 ### Installation

 1. Install the package using npm:
    ```bash
    npm install @stexcore/indexed-db
    ```

 ### Usage

Here’s a detailed example of how to use the Data Management Library:

 1. **Creating a Database Instance**:
   First, create a new instance of the database with the desired schema.

   ```javascript
   import { IndexedDB } from '@stexcore/indexed-db';

   const database = new IndexedDB("stexcore", {
     users: {
       id: {
         type: "number",
         primarykey: true,
         autoincrement: true
       },
       username: {
         type: "string",
         unique: true
       },
       phone: {
         type: "string",
         allow_null: true,
       }
     }
   });
   ```

   Alternatively, you can create a structure for your database tables using an external file.

   ```javascript
   // structure.ts
   import { createStructTables } from '@stexcore/indexed-db';

   const structure = createStructTables({
     users: {
       id: {
         type: "number",
         primarykey: true,
         autoincrement: true
       },
       username: {
         type: "string",
         unique: true
       },
       phone: {
         type: "string",
         allow_null: true,
       }
     }
   });

   export default structure;
   ```

   Then, declare the database by passing the structure:

   ```javascript
   import { IndexedDB } from '@stexcore/indexed-db';
   import structure from './structure';

   const database = new IndexedDB("stexcore", structure);
   ```

 2. **Getting Records**:
    You can retrieve records from the database using various methods.

    - **Find All Records**:
      ```javascript
      database.getTable("users")
        .then((user) => {
          user.findAll()
            .then((records) => {
              console.log("Searched records:", records);
            })
            .catch((err) => {
              console.error(err);
            });
        })
        .catch((err) => {
          console.error(err);
        });
      ```

    - **Find Records with Conditions**:
      ```javascript
      database.getTable("users")
        .then((user) => {
          user.findAll({
            where: {
              username: "stexcore"
            },
            limit: 1,
            offset: 0
          })
          .then((records) => {
            console.log("Searched records:", records);
          })
          .catch((err) => {
            console.error(err);
          });
        })
        .catch((err) => {
          console.error(err);
        });
      ```

 3. **Inserting Records**:
    You can insert single or multiple records into the database.

    - **Insert a Single Record**:
      ```javascript
      database.getTable("users")
        .then((user) => {
          user.insert({
            username: "stexcore",
            phone: null
          })
          .then((records) => {
            console.log("Records inserted:", records);
          })
          .catch((err) => {
            console.error(err);
          });
        })
        .catch((err) => {
          console.error(err);
        });
      ```

    - **Insert Multiple Records**:
      ```javascript
      database.getTable("users")
        .then((user) => {
          user.insert([
            {
              username: "stexcore",
              phone: null
            },
            {
              username: "technology",
              phone: "+58 412 0000 000"
            }
          ])
          .then((records) => {
            console.log("Records inserted:", records);
          })
          .catch((err) => {
            console.error(err);
          });
        })
        .catch((err) => {
          console.error(err);
        });
      ```

 4. **Updating Records**:
    You can update existing records based on specific conditions.

    ```javascript
    database.getTable("users")
      .then((user) => {
        user.update({
          phone: null
        }, {
          where: {
            username: "stexcore"
          }
        })
        .then(({ n_affected }) => {
          console.log("Records updated:", n_affected);
        })
        .catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
      });
    ```

 5. **Deleting Records**:
    You can delete records that match certain criteria.

    ```javascript
    database.getTable("users")
      .then((user) => {
        user.delete({
          where: {
            username: "stexcore"
          }
        })
        .then(({ n_affected }) => {
          console.log("Records deleted:", n_affected);
        })
        .catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
      });
    ```

 ### Note
 Make sure to handle errors appropriately in your application to ensure a smooth user experience.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Thank you for checking out this project! Your feedback and contributions are greatly appreciated.