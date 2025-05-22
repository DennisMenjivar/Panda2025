import SQLite from 'react-native-sqlite-2';

const db = SQLite.openDatabase('mydb.db', '1.0', '', 1);

db.transaction((tx) => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, name TEXT);'
  );
  tx.executeSql('INSERT INTO users (name) VALUES (?)', ['John']);
  tx.executeSql('SELECT * FROM users', [], (tx, results) => {
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      console.log(`User ${rows.item(i).id}: ${rows.item(i).name}`);
    }
  });
});

// SQLite.DEBUG(true);
// SQLite.enablePromise(true);

// const dbName = 'Panda.db';

// export const openDatabase = async () => {
//   try {
//     const db = await SQLite.openDatabase({ name: dbName, location: 'default' });
//     console.log('Database opened');
//     return db;
//   } catch (error) {
//     console.error('Error opening database:', error);
//   }
// };

// // CREATE THE TABLES ( diaria_detalle, diaria_ticket)
// export const initDatabase = async () => {
//   const db = await openDatabase();

//   await db.executeSql(`
//       CREATE TABLE IF NOT EXISTS diaria_ticket (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         total_lempiras INTEGER,
//         created_at TEXT
//       );
//     `);

//   await db.executeSql(`
//       CREATE TABLE IF NOT EXISTS diaria_detalle (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         ticket_id INTEGER,
//         number INTEGER,
//         lempiras INTEGER,
//         FOREIGN KEY (ticket_id) REFERENCES diaria_ticket(id)
//       );
//     `);

//   console.log('Tables created');
// };

// // SAVE TICKET WITH DETAILS
// export const insertTicketWithDetails = async (details) => {
//   const db = await openDatabase();

//   const total = details.reduce((sum, item) => sum + item.lempiras, 0);
//   const createdAt = new Date().toISOString();

//   // Insert ticket
//   const [{ insertId }] = await db.executeSql(
//     'INSERT INTO diaria_ticket (total_lempiras, created_at) VALUES (?, ?)',
//     [total, createdAt]
//   );

//   // Insert all diaria_detalle linked to ticket
//   for (const d of details) {
//     await db.executeSql(
//       'INSERT INTO diaria_detalle (ticket_id, number, lempiras) VALUES (?, ?, ?)',
//       [insertId, d.number, d.lempiras]
//     );
//   }

//   console.log(`Ticket ${insertId} saved with ${details.length} entries.`);
// };

// // GET TICKETS WITH DETAILS
// export const getTicketsWithDetails = async () => {
//   const db = await openDatabase();
//   const [ticketResult] = await db.executeSql(
//     'SELECT * FROM tickets ORDER BY created_at DESC'
//   );

//   const tickets = [];
//   for (let i = 0; i < ticketResult.rows.length; i++) {
//     const ticket = ticketResult.rows.item(i);
//     const [detailsResult] = await db.executeSql(
//       'SELECT * FROM diaria_detalle WHERE ticket_id = ?',
//       [ticket.id]
//     );

//     const details = [];
//     for (let j = 0; j < detailsResult.rows.length; j++) {
//       details.push(detailsResult.rows.item(j));
//     }

//     tickets.push({
//       ...ticket,
//       details,
//     });
//   }

//   return tickets;
// };

// // CREATE NUMBER
// export const insertDiariaDetalle = async ({ ticketId, number, lempiras }) => {
//   const db = await openDatabase();
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `INSERT INTO diaria_detalle (ticket_id, number, lempiras) VALUES (?, ?, ?)`,
//         [ticketId, number, lempiras],
//         (_, result) => {
//           console.log('DiariaDetalle inserted with ID:', result.insertId);
//           resolve(result.insertId);
//         },
//         (_, error) => {
//           console.error('Insert failed:', error);
//           reject(error);
//         }
//       );
//     });
//   });
// };

// // GET TICKET BY ID
// export const getDiariaDetallesByTicket = async (ticketId) => {
//   const db = await openDatabase();
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `SELECT * FROM diaria_detalle WHERE ticket_id = ?`,
//         [ticketId],
//         (_, { rows }) => {
//           resolve(rows._array);
//         },
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // CREATE TICKET
// export const createTicket = async (totalLempiras) => {
//   const db = await openDatabase();
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `INSERT INTO diaria_ticket (total_lempiras) VALUES (?)`,
//         [totalLempiras],
//         (_, result) => {
//           console.log('Ticket created with ID:', result.insertId);
//           resolve(result.insertId);
//         },
//         (_, error) => {
//           console.error('Ticket insert failed:', error);
//           reject(error);
//         }
//       );
//     });
//   });
// };

// // GET TICKETS WITH DETAILS
// export const getTicketWithDetalles = async (ticketId) => {
//   const db = await openDatabase();
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `SELECT t.id as ticket_id, t.total_lempiras, t.created_at, d.number, d.lempiras
//            FROM diaria_ticket t
//            LEFT JOIN diaria_detalle d ON t.id = d.ticket_id
//            WHERE t.id = ?`,
//         [ticketId],
//         (_, { rows }) => resolve(rows._array),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };
