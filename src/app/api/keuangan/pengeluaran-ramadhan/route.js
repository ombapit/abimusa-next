import mysql from 'mysql2/promise';

// Konfigurasi koneksi MariaDB
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
      SELECT id, tipe_transaksi, deskripsi, debit, kredit,
             saldo_awal, saldo_akhir, created_at, tanggal
      FROM transaksi_keuangan
      WHERE tipe_transaksi = 'ramadhan'
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

    if (!body.deskripsi || body.debit === undefined || body.kredit === undefined) {
      return new Response(
        JSON.stringify({ error: 'Deskripsi, Debit, dan Kredit harus diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    conn = await pool.getConnection();

    // Ambil saldo terakhir
    const [saldoRows] = await conn.query(`
      SELECT COALESCE(saldo_akhir, 0) AS saldo_awal
      FROM transaksi_keuangan
      WHERE tipe_transaksi = 'ramadhan'
      ORDER BY id DESC
      LIMIT 1
    `);

    const saldoAwal = saldoRows.length ? Number(saldoRows[0].saldo_awal) : 0;

    // Hitung saldo akhir
    const debit  = Number(body.debit);
    const kredit = Number(body.kredit);
    const saldoAkhir = saldoAwal + kredit - debit;

    // Insert data
    const [result] = await conn.execute(
      `INSERT INTO transaksi_keuangan
       (tipe_transaksi, deskripsi, debit, kredit,
        saldo_awal, saldo_akhir, tanggal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        'ramadhan',
        body.deskripsi,
        debit,
        kredit,
        saldoAwal,
        saldoAkhir,
        body.tanggal,
      ]
    );

    // Ambil data yang baru diinsert
    const [rows] = await conn.query(
      `SELECT id, tipe_transaksi, deskripsi, debit, kredit,
              saldo_awal, saldo_akhir, tanggal, created_at
       FROM transaksi_keuangan
       WHERE id = ?`,
      [result.insertId]
    );

    return new Response(JSON.stringify(rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error inserting data:', error);

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

// Optional: close pool on shutdown
process.on('SIGTERM', async () => {
  await pool.end();
});