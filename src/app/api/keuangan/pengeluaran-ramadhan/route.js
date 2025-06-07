import { Pool } from 'pg';

// Konfigurasi koneksi ke PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'public',
});

export async function GET() {
  try {
    // Membuat koneksi ke database
    const client = await pool.connect();

    try {
      // Query ke tabel donatur_ramadhan (sesuaikan nama tabel jika berbeda)
      const result = await client.query(`
        SELECT id, tipe_transaksi, deskripsi, debit, kredit, saldo_awal, saldo_akhir, created_at, tanggal
        FROM transaksi_keuangan
        where tipe_transaksi='ramadhan'
        ORDER BY id ASC
      `);

      // Mengembalikan data dalam format JSON
      return new Response(JSON.stringify(result.rows), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } finally {
      // Melepaskan koneksi kembali ke pool
      client.release();
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

export async function POST(request) {
  try {
    // Parse body request
    const body = await request.json();

    // Validasi input
    if (body.kode_akses != "dkm") {
      return new Response(
        JSON.stringify({ error: 'Kode Akses Salah' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!body.deskripsi || !body.debit || !body.kredit) {
      return new Response(
        JSON.stringify({ error: 'Deskripsi, Debit/Kredit harus diisi' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Membuat koneksi ke database
    const client = await pool.connect();

    try {
      // Ambil saldo terakhir (jika tabel kosong, gunakan 0)
      const saldoQuery = await client.query("SELECT COALESCE(saldo_akhir, 0) AS saldo_awal FROM transaksi_keuangan where tipe_transaksi='ramadhan' order by id desc");
      const saldoAwal = saldoQuery.rows.length > 0 ? saldoQuery.rows[0].saldo_awal : 0;

      // Hitung saldo akhir
      const saldoAkhir = parseFloat(saldoAwal) + parseFloat(body.kredit - body.debit);
    
      // Query untuk insert data
      const result = await client.query(
        `INSERT INTO transaksi_keuangan 
        (tipe_transaksi, deskripsi, debit, kredit, saldo_awal, saldo_akhir, tanggal, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING id, tipe_transaksi, deskripsi, debit, kredit, saldo_awal, saldo_akhir, tanggal, created_at`,
        ['ramadhan', body.deskripsi, body.debit, body.kredit, saldoAwal, saldoAkhir, body.tanggal]
      );
        
      // Return data yang baru ditambahkan
      return new Response(
        JSON.stringify(result.rows[0]),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

    } finally {
      // Release connection
      client.release();
    }

  } catch (error) {
    console.error('Error inserting data:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // unique violation
      return new Response(
        JSON.stringify({ error: 'Data sudah ada' }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

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