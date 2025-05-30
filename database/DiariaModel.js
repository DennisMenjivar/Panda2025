import { getDBConnection } from '../database/db';
import { DiariaStatus } from '../constants';
import { Alert } from 'react-native';

export const createTables = async () => {
  try {
    const db = await getDBConnection();

    // Create Week Closure table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS week_closure (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        date TEXT DEFAULT (datetime('now', 'localtime')),
        status INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        user_id INTEGER,
        user TEXT,
        totalPorcentWinnigSeller INTEGER DEFAULT 0,
        totalWinning INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);

    // Create Closure table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS closure (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        date TEXT DEFAULT (datetime('now', 'localtime')),
        status INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        user_id INTEGER,
        user TEXT,
        winningNumber INTEGER,
        totalWinning INTEGER DEFAULT 0,
        totalPorcentWinnigSeller INTEGER DEFAULT 0,
        week_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES user(id),
        FOREIGN KEY (week_id) REFERENCES week_closure(id)
      );
    `);

    // Create Diaria Ticket table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS diaria_ticket (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_lempiras INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        status INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT (datetime('now', 'localtime')),
        closure_id INTEGER,
        FOREIGN KEY (closure_id) REFERENCES closure(id)
      );
    `);

    // Create Diaria Detalle table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS diaria_detalle (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        number INTEGER NOT NULL,
        lempiras INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (ticket_id) REFERENCES diaria_ticket(id)
      );
    `);

    // Create Diaria Limits table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS diaria_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL,
        lempiras INTEGER NOT NULL,
        spent INTEGER DEFAULT 0,
        updated_at TEXT
      );
    `);

    // Create User table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        kind INTEGER,
        license TEXT,
        status INTEGER DEFAULT 1,
        telephone TEXT,
        expiration_license TEXT,
        passcode INTEGER
      );
    `);

    // Indexes for foreign keys (performance)
    await db.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_ticket_closure ON diaria_ticket(closure_id);`
    );
    await db.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_detalle_ticket ON diaria_detalle(ticket_id);`
    );
    await db.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_closure_week ON closure(week_id);`
    );
    return 1;
  } catch (error) {
    return 0;
  }
};

// GET CURRENT ACTIVE USER
export const getCurrentActiveUser = async () => {
  const db = await getDBConnection();
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM user 
         WHERE status = 1 
           AND expiration_license IS NOT NULL 
           AND date(expiration_license) >= date(?) 
         LIMIT 1`,
        [today],
        (_, result) => {
          if (result.rows.length > 0) {
            const user = result.rows.item(0);
            resolve(user);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          reject(null);
          // reject(error);
        }
      );
    });
  });
};

// SAVE USER TO SQLITE
export const saveUserToSQLite = async (user) => {
  const db = await getDBConnection();

  const toDateString = (timestamp) => {
    if (!timestamp?.seconds) return '2099-12-31';
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split('T')[0];
  };

  const userToSave = {
    user_id: user.user_id,
    username: user.username,
    password: user.password,
    name: user.name,
    kind: user.kind === 'admin' ? 1 : 0,
    license: user.license,
    status: parseInt(user.status),
    telephone: user.telephone,
    expiration_license: toDateString(user.expiration_license),
    passcode: parseInt(user.passcode),
  };

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO user 
            (user_id, username, password, name, kind, license, status, telephone, expiration_license, passcode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userToSave.user_id,
            userToSave.username,
            userToSave.password,
            userToSave.name,
            userToSave.kind,
            userToSave.license,
            userToSave.status,
            userToSave.telephone,
            userToSave.expiration_license,
            userToSave.passcode,
          ],
          (_, result) => {
            console.log('✅ Usuario guardado');
            resolve(userToSave); // ✅ return saved user object
          },
          (_, error) => {
            console.error('❌ Error al guardar usuario:', error);
            resolve(false);
          }
        );
      },
      (txError) => {
        console.error('❌ Error en la transacción:', txError);
        resolve(false);
      }
    );
  });
};

// INSERT TICKET IF THERE IS NONE IN DRAFT
export const insertDiariaTicketIfNotExists = async () => {
  const db = await getDBConnection();
  const createdAt = new Date().toISOString();
  try {
    // Step 1: Check for existing draft ticket
    const [draftResult] = await db.executeSql(
      'SELECT id FROM diaria_ticket WHERE status = ? LIMIT 1',
      [DiariaStatus.DRAFT]
    );

    if (draftResult.rows.length > 0) {
      const existingId = draftResult.rows.item(0).id;
      console.log('⚠️ Draft ticket already exists:', existingId);
      return existingId;
    }

    // Step 2: Check or create week_closure
    const [weekResult] = await db.executeSql(
      'SELECT id FROM week_closure WHERE status = 0 ORDER BY id DESC LIMIT 1'
    );

    let weekId;
    if (weekResult.rows.length > 0) {
      weekId = weekResult.rows.item(0).id;
    } else {
      const [insertWeek] = await db.executeSql(
        `INSERT INTO week_closure (description, user_id, user) VALUES (?, ?, ?)`,
        ['Weekly Closure: ' + createdAt.toString(), 1, 'normal']
      );
      weekId = insertWeek.insertId;
    }

    // Step 3: Create new closure row
    const [insertClosure] = await db.executeSql(
      `INSERT INTO closure (description, user_id, user, week_id)
       VALUES (?, ?, ?, ?)`,
      ['Daily Closure: ' + createdAt.toString(), 1, 'normal', weekId]
    );
    const closureId = insertClosure.insertId;

    // Step 4: Create diaria_ticket row
    const [insertTicket] = await db.executeSql(
      `INSERT INTO diaria_ticket (closure_id) VALUES (?)`,
      [closureId]
    );
    const ticketId = insertTicket.insertId;

    console.log('✅ New draft ticket created with ID:', ticketId);
    return ticketId;
  } catch (error) {
    console.error('❌ Error inserting draft ticket:', error);
    return null;
  }
};
// -------------------------------------------

// GET DRAFT TICKETS
export const getDraftTickets = async () => {
  const db = await getDBConnection();

  try {
    // 1️⃣ Get the open closure (status = 0)
    const [closureResult] = await db.executeSql(
      `SELECT id FROM closure WHERE status = 0 LIMIT 1`
    );

    if (closureResult.rows.length === 0) {
      console.warn('⚠️ No open closure found');
      return { tickets: [], closure_id: -1 };
    }

    const closureId = closureResult.rows.item(0).id;
    console.log('closureId: ', closureId);

    // 2️⃣ Get tickets with that closure_id and status = 0
    const [ticketResult] = await db.executeSql(
      `SELECT id, total_lempiras, status, created_at, closure_id 
       FROM diaria_ticket 
       WHERE status = 1 AND closure_id = ?
       ORDER BY datetime(created_at) DESC`,
      [closureId]
    );

    const tickets = [];
    let sumTotal = 0;
    for (let i = 0; i < ticketResult.rows.length; i++) {
      sumTotal += ticketResult.rows.item(i).total_lempiras;
      tickets.push(ticketResult.rows.item(i));
    }

    return { tickets: tickets, closure_id: closureId, sumTotal };
  } catch (error) {
    console.error('❌ Error getting tickets from open closure:', error);
    return {};
  }
};

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
      `INSERT INTO diaria_detalle (ticket_id, number, lempiras)
       VALUES (?, ?, ?)`,
      [ticketId, number, lempiras]
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
      `SELECT SUM(total_lempiras) as total FROM diaria_ticket WHERE status = 0`
    );

    if (result.rows.length > 0 && result.rows.item(0).total !== null) {
      const total = result.rows.item(0).total;
      console.log('💰 Total lempiras for draft tickets:', total);
      return total;
    } else {
      console.log('⚠️ No draft tickets found');
      return 0;
    }
  } catch (error) {
    console.error('❌ Error getting total_lempiras:', error);
    return null;
  }
};

// INSERT DETAULT PEDAZOS
export const insertDefaultPedazos = async () => {
  const db = await getDBConnection();
  const updatedAt = new Date().toISOString();

  try {
    // Step 1: Check if any rows already exist
    const [result] = await db.executeSql(
      `SELECT COUNT(*) as count FROM diaria_limits`
    );
    const count = result.rows.item(0).count;

    if (count > 0) {
      console.log('⚠️ Pedazos already initialized. Skipping insert.');
      return -2;
    }

    // Step 2: Insert values only if table is empty
    for (let i = 0; i < 100; i++) {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          `INSERT INTO diaria_limits (number, lempiras, spent, updated_at) VALUES (?, ?, ?, ?)`,
          [i, 200, 0, updatedAt]
        );
      });
    }

    console.log(
      '✅ Successfully inserted numbers 0 to 99 with 200 pedazos each'
    );
    return 1;
  } catch (error) {
    console.error('❌ Error inserting pedazos:', error);
    return 0;
  }
};

// GET ALL PEDAZOS
export const getAllPedazos = async () => {
  const db = await getDBConnection();
  try {
    const [result] = await db.executeSql(
      `SELECT * FROM diaria_limits ORDER BY number ASC`
    );
    const items = [];

    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching pedazos:', error);
    return [];
  }
};

// UPDATES LEMPIRAS BY RANGE
export const updateLempirasByRange = async (start, end, newAmount) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(
      `UPDATE diaria_limits SET lempiras = ?, updated_at = ? WHERE number BETWEEN ? AND ?`,
      [newAmount, new Date().toISOString(), start, end]
    );

    console.log(
      `✅ Updated lempiras to Lps. ${newAmount} for numbers ${start} to ${end}`
    );
    return true;
  } catch (error) {
    console.error('❌ Error updating lempiras by range:', error);
    return false;
  }
};

// CHECK AVAILABILITY PER NUMBER
export const checkAvailabilityByNumber = async (number, lempirasToInsert) => {
  const db = await getDBConnection();

  try {
    // 1️⃣ Get current open closure (status = 0)
    const [closureResult] = await db.executeSql(
      'SELECT id FROM closure WHERE status = 0 LIMIT 1'
    );

    if (closureResult.rows.length === 0) {
      return { success: false, message: 'No open closure in progress' };
    }

    const closureId = closureResult.rows.item(0).id;

    // 2️⃣ Get ticket_ids from diaria_ticket linked to that closure
    const [ticketResult] = await db.executeSql(
      'SELECT id FROM diaria_ticket WHERE closure_id = ?',
      [closureId]
    );

    if (ticketResult.rows.length === 0) {
      return {
        success: false,
        message: 'No tickets found for current closure',
      };
    }

    const ticketIds = [];
    for (let i = 0; i < ticketResult.rows.length; i++) {
      ticketIds.push(ticketResult.rows.item(i).id);
    }

    const placeholders = ticketIds.map(() => '?').join(',');

    // 3️⃣ Get current total lempiras from diaria_detalle for this number across all those tickets
    const [sumResult] = await db.executeSql(
      `SELECT SUM(lempiras) as total 
       FROM diaria_detalle 
       WHERE number = ? AND ticket_id IN (${placeholders})`,
      [number, ...ticketIds]
    );

    const currentTotal = sumResult.rows.item(0).total || 0;
    const newTotal = currentTotal + lempirasToInsert;

    // 4️⃣ Get max allowed lempiras for the number
    const [limitResult] = await db.executeSql(
      'SELECT lempiras FROM diaria_limits WHERE number = ?',
      [number]
    );

    if (limitResult.rows.length === 0) {
      return {
        success: false,
        message: `Number ${number} not defined in limits`,
      };
    }

    const maxAllowed = limitResult.rows.item(0).lempiras;

    // 5️⃣ Validate
    if (newTotal > maxAllowed) {
      return {
        success: false,
        message: `Limit exceeded for number ${number}. Max: ${maxAllowed}, current: ${currentTotal}, trying to add: ${lempirasToInsert}`,
      };
    }

    return { success: true, message: 'Valid amount. Insert allowed.' };
  } catch (error) {
    console.error('❌ DB error in checkAvailabilityByNumber:', error);
    return { success: false, message: 'DB error' };
  }
};

// GET THE AVAILABILITY PER NUMBER
export const getAvailabilityAmountByNumber = async (number) => {
  const db = await getDBConnection();

  try {
    // 1. Get current open closure (status = 0)
    const [closureResult] = await db.executeSql(
      'SELECT id FROM closure WHERE status = 0 LIMIT 1'
    );

    if (closureResult.rows.length === 0) {
      return { success: false, amount: 0, message: 'No closure in progress' };
    }

    const closureId = closureResult.rows.item(0).id;

    // 2. Get ticket_ids from diaria_ticket linked to that closure
    const [ticketResult] = await db.executeSql(
      'SELECT id FROM diaria_ticket WHERE closure_id = ?',
      [closureId]
    );

    if (ticketResult.rows.length === 0) {
      return {
        success: false,
        amount: 0,
        message: 'No tickets in current closure',
      };
    }

    const ticketIds = [];
    for (let i = 0; i < ticketResult.rows.length; i++) {
      ticketIds.push(ticketResult.rows.item(i).id);
    }

    const placeholders = ticketIds.map(() => '?').join(',');

    // 3. Get SUM(lempiras) from diaria_detalle where number = ? and ticket_id IN (...)
    const [sumResult] = await db.executeSql(
      `SELECT SUM(lempiras) as total 
       FROM diaria_detalle 
       WHERE number = ? AND ticket_id IN (${placeholders})`,
      [number, ...ticketIds]
    );

    const totalUsed = sumResult.rows.item(0).total || 0;

    // 4. Get the max allowed from diaria_limits
    const [limitResult] = await db.executeSql(
      'SELECT lempiras FROM diaria_limits WHERE number = ?',
      [number]
    );

    const maxAllowed =
      limitResult.rows.length > 0 ? limitResult.rows.item(0).lempiras : 0;

    return {
      success: true,
      amount: maxAllowed - totalUsed,
      message: 'Success',
    };
  } catch (error) {
    console.error('❌ Error in getAvailabilityAmountByNumber:', error);
    return {
      success: false,
      amount: 0,
      message: 'DB error',
    };
  }
};

// GET THE TICKET DETAILS BY TICKET ID
export const getDetalleByTicketId = async (ticketId) => {
  const db = await getDBConnection();

  try {
    const [result] = await db.executeSql(
      `SELECT id, number, lempiras FROM diaria_detalle WHERE ticket_id = ? ORDER BY number ASC`,
      [ticketId]
    );

    const items = [];
    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching detalle:', error);
    return [];
  }
};

// GET THE TICKETS IN DRAFT COUNT
export const getDetalleCountByDraftTicket = async () => {
  const db = await getDBConnection();
  try {
    const [result] = await db.executeSql(`
      SELECT COUNT(*) as count
      FROM diaria_ticket dt
      JOIN diaria_detalle dd ON dt.id = dd.ticket_id
      WHERE dt.status = 0
    `);

    const count = result.rows.item(0).count;
    return count;
  } catch (error) {
    return 0;
  }
};

// DELETE ALL TICKETS BY TICKET_ID
export const deleteAllDetalleByTicketId = async (ticketId) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(`DELETE FROM diaria_detalle WHERE ticket_id = ?`, [
      ticketId,
    ]);
    await db.executeSql(
      `UPDATE diaria_ticket SET total_lempiras = 0 WHERE id = ?`,
      [ticketId]
    );
    return true;
  } catch (error) {
    return false;
  }
};

// FINALIZE TICKET
export const finalizeTicket = async (ticketId, navigation) => {
  const db = await getDBConnection();

  try {
    // Step 1: Update current ticket to PUBLISHED (status = 1)
    await db.executeSql(`UPDATE diaria_ticket SET status = 1 WHERE id = ?`, [
      ticketId,
    ]);

    // Step 2: Get the current open closure (status = 0)
    const [closureResult] = await db.executeSql(
      `SELECT id FROM closure WHERE status = 0 LIMIT 1`
    );

    if (closureResult.rows.length === 0) {
      alert('⚠️ No hay cierre activo para asociar el nuevo ticket.');
      return 0;
    }

    const closureId = closureResult.rows.item(0).id;

    // Step 3: Insert a new ticket linked to that closure
    await db.executeSql(
      `INSERT INTO diaria_ticket (status, total_lempiras, closure_id) VALUES (?, ?, ?)`,
      [0, 0, closureId]
    );

    // Step 4: Navigate or show success message
    navigation.navigate('Panda');
    Alert.alert(
      '✅Guardado', // title
      'Ticket #' + ticketId + ' creado correctamente!', // message
      [
        {
          text: 'Entendido',
        },
      ],
      { cancelable: true }
    );
    return 1;
  } catch (error) {
    console.error('❌ Error finalizando ticket:', error);
    alert('❌ No se pudo finalizar el ticket.');
    return 0;
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
