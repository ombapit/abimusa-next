// app/api/donatur-ramadhan/route.js
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
        SELECT id, nama, jenis_pembayaran, jumlah, created_at
        FROM donasi
        where jenis='ramadhan'
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
    if (!body.nama || !body.nama || !body.jenis_pembayaran || !body.jumlah) {
      return new Response(
        JSON.stringify({ error: 'Nama, jenis pembayaran, dan jumlah harus diisi' }),
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
      // Query untuk insert data
      const result = await client.query(
        `INSERT INTO donasi 
        (nama, jenis_pembayaran, jumlah, jenis, created_at) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id, nama, jenis_pembayaran, jumlah, created_at`,
        [body.nama, body.jenis_pembayaran, body.jumlah, 'ramadhan']
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