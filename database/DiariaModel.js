import { getDBConnection } from '../database/db';
import { DiariaStatus } from '../constants';

export const createTables = async () => {
  const db = await getDBConnection();
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS diaria_ticket (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_lempiras INTEGER,
        created_at TEXT,
        status INTEGER DEFAULT 0,
        updated_at TEXT
    );
  `);

  await db.executeSql(`
      CREATE TABLE IF NOT EXISTS diaria_detalle (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER,
        number INTEGER,
        lempiras INTEGER,
        created_at TEXT,
        FOREIGN KEY (ticket_id) REFERENCES diaria_ticket(id)
      );
    `);
  console.log('Tables created');
};

// INSERT TICKET IF THERE IS NONE IN DRAFT
export const insertDiariaTicketIfNotExists = async () => {
  const db = await getDBConnection();
  try {
    // Step 1: Check if any draft exists (status = 0)
    const [result] = await db.executeSql(
      'SELECT id FROM diaria_ticket WHERE status = ? LIMIT 1',
      [DiariaStatus.DRAFT]
    );

    if (result.rows.length > 0) {
      const existingId = result.rows.item(0).id;
      console.log('⚠️ Draft already exists. Returning ID:', existingId);
      return existingId;
    }

    const now = new Date().toISOString();
    const [insertResult] = await db.executeSql(
      'INSERT INTO diaria_ticket (total_lempiras, created_at, updated_at) VALUES (?, ?, ?)',
      [0, now, now]
    );

    const newId = insertResult.insertId;
    console.log('✅ New draft created with ID:', newId);
    return newId;
  } catch (error) {
    console.error('❌ Error checking/inserting draft:', error);
    return null;
  }
};
// -------------------------------------------

// INSERT DIARIA DETALLE (NUMBER)
export const insertDetalleAndUpdateTicket = async (number, lempiras) => {
  const db = await getDBConnection();
  const createdAt = new Date().toISOString();

  try {
    // 1️⃣ Get or create a draft diaria_ticket
    const [selectResult] = await db.executeSql(
      `SELECT id, total_lempiras FROM diaria_ticket WHERE status = 0 LIMIT 1`
    );

    let ticketId;
    let currentTotal = 0;

    if (selectResult.rows.length > 0) {
      const row = selectResult.rows.item(0);
      ticketId = row.id;
      currentTotal = row.total_lempiras;
    } else {
      // No draft ticket found, create a new one
      const [insertTicketResult] = await db.executeSql(
        `INSERT INTO diaria_ticket (total_lempiras, created_at, updated_at, status)
         VALUES (?, ?, ?, ?)`,
        [0, createdAt, createdAt, 0]
      );
      ticketId = insertTicketResult.insertId;
    }

    // 2️⃣ Insert the new diaria_detalle row
    const [insertDetalleResult] = await db.executeSql(
      `INSERT INTO diaria_detalle (ticket_id, number, lempiras, created_at)
       VALUES (?, ?, ?, ?)`,
      [ticketId, number, lempiras, createdAt]
    );

    // 3️⃣ Update total_lempiras in diaria_ticket
    const newTotal = currentTotal + lempiras;
    await db.executeSql(
      `UPDATE diaria_ticket SET total_lempiras = ?, updated_at = ? WHERE id = ?`,
      [newTotal, createdAt, ticketId]
    );

    console.log(
      `✅ detalle inserted with ID ${insertDetalleResult.insertId}, ticket ID ${ticketId} updated to Lps. ${newTotal}`
    );
    return { detalleId: insertDetalleResult.insertId, ticketId };
  } catch (error) {
    console.error('❌ Error in insertDetalleAndUpdateTicket:', error);
    return null;
  }
};

// GET TOTAL LEMPIRAS
export const getTotalLempirasFromDraftTicket = async () => {
  const db = await getDBConnection();
  try {
    const [result] = await db.executeSql(
      `SELECT total_lempiras FROM diaria_ticket WHERE status = 0 LIMIT 1`
    );

    if (result.rows.length > 0) {
      const total = result.rows.item(0).total_lempiras;
      console.log('💰 Draft ticket total_lempiras:', total);
      return total;
    } else {
      console.log('⚠️ No draft ticket found');
      return 0;
    }
  } catch (error) {
    console.error('❌ Error getting total_lempiras:', error);
    return null;
  }
};

export const insertDiariaTicket = async (total_lempiras) => {
  const now = new Date().toISOString();
  const db = await getDBConnection();
  const [{ insertId }] = await db.executeSql(
    'INSERT INTO diaria_ticket (total_lempiras, updated_at, created_at) VALUES (?, ?, ?)',
    [total_lempiras, now, now]
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
