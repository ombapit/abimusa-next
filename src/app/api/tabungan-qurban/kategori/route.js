import mysql from 'mysql2/promise';

// Konfigurasi koneksi ke MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET() {
  try {
    // Membuat koneksi ke database
    const connection = await pool.getConnection();

    try {
      // Query ke tabel donatur_ramadhan (sesuaikan nama tabel jika berbeda)
      // Menggunakan IFNULL sebagai pengganti NVL untuk MariaDB/MySQL
      const [rows] = await connection.execute(`
        SELECT a.id, 
        IFNULL(SUM(c.jumlah), 0) AS tercapai,
        (a.target - IFNULL(SUM(c.jumlah), 0)) AS sisa,
        a.nama_kelompok AS title 
        FROM kelompok_qurban a
        LEFT JOIN peserta_qurban b ON a.id = b.kq_id 
        LEFT JOIN pembayaran_qurban c ON b.id = c.pq_id
        GROUP BY a.id, a.nama_kelompok, a.target
      `);

      // Konversi angka string → number
      const data = (rows.map(item => ({
        ...item,
        tercapai: Number(item.tercapai),
        sisa: Number(item.sisa),
      })))

      // Mengembalikan data dalam format JSON
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } finally {
      // Melepaskan koneksi kembali ke pool
      connection.release();
    }
  } catch (error) {
    console.error('Error querying database:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Optional: Menutup pool saat aplikasi dimatikan
process.on('SIGTERM', async () => {
  await pool.end();
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});