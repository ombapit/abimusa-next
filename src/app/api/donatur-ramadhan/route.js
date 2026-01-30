// app/api/donatur-ramadhan/route.js
import mysql from 'mysql2/promise';

// Konfigurasi koneksi ke MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET() {
  let conn;
  try {
    conn = await pool.getConnection();

    const [rows] = await conn.query(`
      SELECT id, nama, jenis_pembayaran, jumlah, tanggal
      FROM donasi
      WHERE jenis = 'ramadhan'
      ORDER BY id ASC
    `);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error querying database:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    if (conn) conn.release();
  }
}

export async function POST(request) {
  let conn;
  try {
    const body = await request.json();

    // Validasi akses
    if (body.kode_akses !== 'dkm') {
      return new Response(
        JSON.stringify({ error: 'Kode Akses Salah' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.nama || !body.jenis_pembayaran || !body.jumlah) {
      return new Response(
        JSON.stringify({ error: 'Nama, jenis pembayaran, dan jumlah harus diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    conn = await pool.getConnection();

    const [result] = await conn.execute(
      `INSERT INTO donasi
       (nama, jenis_pembayaran, jumlah, jenis, tanggal)
       VALUES (?, ?, ?, ?, ?)`,
      [body.nama, body.jenis_pembayaran, body.jumlah, 'ramadhan', body.tanggal]
    );

    // Ambil data yang baru diinsert
    const [rows] = await conn.query(
      `SELECT id, nama, jenis_pembayaran, jumlah, tanggal
       FROM donasi
       WHERE id = ?`,
      [result.insertId]
    );

    return new Response(JSON.stringify(rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error inserting data:', error);

    // Duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return new Response(
        JSON.stringify({ error: 'Data sudah ada' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    if (conn) conn.release();
  }
}

// Optional: close pool saat server shutdown
process.on('SIGTERM', async () => {
  await pool.end();
});
