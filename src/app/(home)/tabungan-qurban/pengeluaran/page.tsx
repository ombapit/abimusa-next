'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast, { Toaster } from 'react-hot-toast'; // Import toast dan Toaster
import * as XLSX from 'xlsx';

// Fungsi format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    // style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

interface TransaksiTabqurban {
  id?: string;
  deskripsi: string;
  debit: string;
  kredit: string;
  saldo_awal: string;
  saldo_akhir: string;
  tanggal: string;
  created_at: string;
}
interface ExcelRow {
  'No': number | string;
  'Deskripsi': string;
  'Debit': string;
  'Kredit': string;
  'Saldo Awal': string;
  'Saldo Akhir': string;
  'Tanggal': string;
  'Tanggal dibuat': string;
}

type HeaderKey = 'No' | 'Deskripsi' | 'Debit' | 'Kredit' | 'Saldo Awal' | 'Saldo Akhir' | 'Tanggal' | 'Tanggal dibuat';

export default function Pengeluaran() {
  const [transaksitabqurban, setTransaksiTabqurban] = useState<TransaksiTabqurban[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kodeAkses: '',
    tanggal: '',
    deskripsi: '',
    debit: '',
    kredit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransaksiTabqurban = async () => {
      try {
        const response = await fetch('/api/tabungan-qurban/pengeluaran');
        const data = await response.json();
        setTransaksiTabqurban(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchTransaksiTabqurban();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/tabungan-qurban/pengeluaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          deskripsi: formData.deskripsi,
          debit: formData.debit || "0",
          kredit: formData.kredit || "0",
          kode_akses: formData.kodeAkses,
        }),
      });

      if (response.ok) {
        const newTransaksiTabqurban = await response.json();
        setTransaksiTabqurban((prev) => [...prev, newTransaksiTabqurban]);
        setFormData(prev => ({ ...prev, kodeAkses: 'dkm', deskripsi: '', debit: '', kredit: '' }));        
        toast.success('Data berhasil disimpan!'); // Toast sukses
      } else {
        const resp = await response.json();
        toast.error(resp.error || 'Gagal menyimpan data'); // Toast gagal
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Terjadi kesalahan saat menyimpan data'); // Toast error
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const exportToExcel = () => {
    // Format data untuk excel
    const excelData: ExcelRow[] = transaksitabqurban.map((item, index) => ({
      'No': index + 1,
      'Deskripsi': item.deskripsi,
      'Debit': formatRupiah(parseInt(item.debit)),
      'Kredit': formatRupiah(parseInt(item.kredit)),
      'Saldo Awal': formatRupiah(parseInt(item.saldo_awal)),
      'Saldo Akhir': formatRupiah(parseInt(item.saldo_akhir)),
      'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      'Tanggal dibuat': new Date(item.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }));

    // Headers
    const headers: HeaderKey[] = ['No', 'Deskripsi', 'Debit', 'Kredit', 'Saldo Awal', 'Saldo Akhir', 'Tanggal', 'Tanggal dibuat'];

    // Buat workbook dan worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData, {
      header: headers
    });

    // Get max width for each column
    const maxWidths = headers.map((header) => {
      const headerWidth = header.length;
      const cellWidths = excelData.map(row => String(row[header]).length);
      return Math.max(headerWidth, ...cellWidths);
    });

    // Style untuk header (abu-abu)
    const headerStyle = {
      fill: {
        fgColor: { rgb: "D3D3D3" }, // Light gray
      },
      font: {
        bold: true,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };

    // Apply styling ke header
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[headerCell]) ws[headerCell] = { v: headers[col] };
      ws[headerCell].s = headerStyle;
    }

    // Set column widths
    ws['!cols'] = maxWidths.map(width => ({
      wch: width + 2 // Add padding
    }));

    // Add border styling
    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    // Apply borders to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cell]) ws[cell] = { v: "" };
        ws[cell].s = {
          ...ws[cell].s,
          border: borderStyle,
        };
      }
    }

    // Add worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Pengeluaran Qurban');

    // Generate filename dengan timestamp
    const date = new Date().toISOString().split('T')[0];
    const filename = `Pengeluaran-Ramadhan-${date}.xlsx`;

    // Write file dan download
    XLSX.writeFile(wb, filename);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen md:mt-15 mt-20">
      {/* Tambahkan Toaster di sini */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <div className="w-full max-w-2xl p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Rincian Pengeluaran Qurban
        </h1>

        <div className="flex gap-2 mb-4">
          <Button 
            className="cursor-pointer" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Tutup Form' : 'Tambah Data'}
          </Button>
          
          <Button 
            variant="outline"
            className="cursor-pointer"
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div>
              <label htmlFor="kodeAkses" className="block text-sm font-medium">
                Kode Akses
              </label>
              <Input
                id="kodeAkses"
                name="kodeAkses"
                value={formData.kodeAkses}
                onChange={handleInputChange}
                placeholder="Masukkan kode akses"
                required
              />
            </div>
            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium">
                Tanggal
              </label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={handleInputChange}
                placeholder="Masukkan Tanggal"
                required
              />
            </div>
            <div>
              <label htmlFor="nama" className="block text-sm font-medium">
                Rincian
              </label>
              <Input
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Masukkan Rincian"
                required
              />
            </div>
            <div>
              <label htmlFor="debit" className="block text-sm font-medium">
                Debit
              </label>
              <Input
                id="debit"
                name="debit"
                type="number"
                value={formData.debit}
                onChange={handleInputChange}
                placeholder="Masukkan Debit"
              />
            </div>
            <div>
              <label htmlFor="kredit" className="block text-sm font-medium">
                Kredit
              </label>
              <Input
                id="kredit"
                name="kredit"
                type="number"
                value={formData.kredit}
                onChange={handleInputChange}
                placeholder="Masukkan Kredit"
              />
            </div>
            <Button 
              type="submit" 
              className="cursor-pointer"
              disabled={isSubmitting} // Disable button while submitting
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button 
              type="button"
              variant="outline"
              className='ms-4'
              onClick={() => setShowForm(false)}
              disabled={isSubmitting} // Optional: disable close button while submitting
            >
              Tutup
            </Button>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Rincian</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead>Kredit</TableHead>
              <TableHead className="text-right">Saldo Awal</TableHead>
              <TableHead className="text-right">Saldo Akhir</TableHead>              
            </TableRow>
          </TableHeader>
          <TableBody>
            {transaksitabqurban.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>{item.deskripsi}</TableCell>
                <TableCell className="text-right">
                  {formatRupiah(parseInt(item.debit))}
                </TableCell>
                <TableCell className="text-right">
                  {formatRupiah(parseInt(item.kredit))}
                </TableCell>
                <TableCell className="text-right">
                  {formatRupiah(parseInt(item.saldo_awal))}
                </TableCell>
                <TableCell className="text-right">
                  {formatRupiah(parseInt(item.saldo_akhir))}
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>            
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}