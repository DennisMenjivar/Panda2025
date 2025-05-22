export const createTables = async (db) => {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS diaria_ticket (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_lempiras INTEGER,
        created_at TEXT
    );
  `);

  await db.executeSql(`
      CREATE TABLE IF NOT EXISTS diaria_detalle (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER,
        number INTEGER,
        lempiras INTEGER,
        FOREIGN KEY (ticket_id) REFERENCES diaria_ticket(id)
      );
    `);
  console.log('Tables created');
};

export const insertDiariaTicket = async (db, total_lempiras) => {
  const now = new Date().toISOString();
  const [{ insertId }] = await db.executeSql(
    'INSERT INTO diaria_ticket (total_lempiras, created_at) VALUES (?, ?)',
    [total_lempiras, now]
  );
  return insertId;
};

export const getDiariaTickets = async (db) => {
  const results = await db.executeSql(
    'SELECT * FROM diaria_ticket ORDER BY created_at DESC'
  );
  const items = [];

  results.forEach(([result]) => {
    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i));
    }
  });

  return items;
};

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
