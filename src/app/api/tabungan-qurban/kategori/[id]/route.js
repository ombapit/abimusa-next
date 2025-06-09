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

export async function GET(request, { params }) {
  const { id } = await params
  try {
    // Membuat koneksi ke database
    const connection = await pool.getConnection();

    try {
      // Query ke tabel donatur_ramadhan (sesuaikan nama tabel jika berbeda)
      // Menggunakan IFNULL sebagai pengganti NVL untuk MariaDB/MySQL
      const [rows] = await connection.execute(`
        SELECT
        a.id,concat(a.nama," - ", a.alamat) as nama,
        COALESCE(sum(jumlah), 0) as total_bayar,
        (c.target/7 - COALESCE(sum(jumlah), 0)) as sisa
        from peserta_qurban a
        left join pembayaran_qurban b on a.id = b.pq_id
        join kelompok_qurban c on a.kq_id = c.id
        where c.id = ?
        group by a.id
        order by concat(a.nama," - ", a.alamat)
      `,[id]);

      const [payments] = await connection.execute(`
        SELECT 
        a.id,a.tanggal_transfer as tanggal,a.jumlah,a.keterangan,
        a.metode_pembayaran as metode,a.bukti_transfer,a.pq_id
        from pembayaran_qurban a
        join peserta_qurban b on a.pq_id = b.id
        join kelompok_qurban c on b.kq_id = c.id
        where c.id = ?
      `,[id]);

      const paymentsGrouped = payments.reduce((acc, payment) => {
        if (!acc[payment.pq_id]) {
          acc[payment.pq_id] = [];
        }
        acc[payment.pq_id].push({
          id: payment.id,
          tanggal: payment.tanggal,
          jumlah: Number(payment.jumlah),
          keterangan: payment.keterangan,
          metode: payment.metode,
          bukti_transfer: payment.bukti_transfer
        });
        return acc;
      }, {});

      const dataWithPayments = rows.map(item => ({
        ...item,
        total_bayar: Number(item.total_bayar),
        sisa: Number(item.sisa),
        payments: paymentsGrouped[item.id] || []
      }));

      // Mengembalikan data dalam format JSON
      return new Response(JSON.stringify(dataWithPayments), {
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