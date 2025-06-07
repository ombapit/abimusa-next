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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast, { Toaster } from 'react-hot-toast'; // Import toast dan Toaster
import * as XLSX from 'xlsx';

// Fungsi format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

interface Donatur {
  id?: string;
  nama: string;
  jumlah: string;
  jenis_pembayaran: string;
  created_at: string;
}
interface ExcelRow {
  'No': number | string;
  'Nama': string;
  'Jenis Pembayaran': string;
  'Tanggal': string;
  'Jumlah': string;
}

type HeaderKey = 'No' | 'Nama' | 'Jenis Pembayaran' | 'Tanggal' | 'Jumlah';

export default function DonaturRamadhan() {
  const [donatur, setDonatur] = useState<Donatur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kodeAkses: '',
    nama: '',
    jumlah: '',
    jenisPembayaran: 'Transfer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDonatur = async () => {
      try {
        const response = await fetch('/api/donatur-ramadhan');
        const data = await response.json();
        setDonatur(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchDonatur();
  }, []);

  const totalJumlah = donatur.reduce((sum, item) => sum + parseInt(item.jumlah), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, jenisPembayaran: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/donatur-ramadhan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: formData.nama,
          jumlah: formData.jumlah,
          jenis_pembayaran: formData.jenisPembayaran,
          kode_akses: formData.kodeAkses,
        }),
      });

      if (response.ok) {
        const newDonatur = await response.json();
        setDonatur((prev) => [...prev, newDonatur]);
        setFormData({ kodeAkses: 'dkm', nama: '', jumlah: '', jenisPembayaran: '' });
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
    const excelData: ExcelRow[] = donatur.map((item, index) => ({
      'No': index + 1,
      'Nama': item.nama,
      'Jenis Pembayaran': item.jenis_pembayaran,
      'Tanggal': new Date(item.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      'Jumlah': formatRupiah(parseInt(item.jumlah)),
    }));
  
    // Tambah row total
    excelData.push({
      'No': '',
      'Nama': '',
      'Jenis Pembayaran': '',
      'Tanggal': 'Total',
      'Jumlah': formatRupiah(totalJumlah),
    });
  
    // Headers
    const headers: HeaderKey[] = ['No', 'Nama', 'Jenis Pembayaran', 'Tanggal', 'Jumlah'];

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

    // Style untuk row total
    const totalRowIndex = excelData.length;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const totalCell = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });
      if (!ws[totalCell]) ws[totalCell] = { v: "" };
      ws[totalCell].s = {
        font: { bold: true },
        border: borderStyle,
      };
    }

    // Add worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Donatur Ramadhan');

    // Generate filename dengan timestamp
    const date = new Date().toISOString().split('T')[0];
    const filename = `Donatur-Ramadhan-${date}.xlsx`;

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
          Daftar Donatur Ramadhan
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
              <label htmlFor="nama" className="block text-sm font-medium">
                Nama
              </label>
              <Input
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Masukkan nama"
                required
              />
            </div>
            <div>
              <label htmlFor="jumlah" className="block text-sm font-medium">
                Jumlah
              </label>
              <Input
                id="jumlah"
                name="jumlah"
                type="number"
                value={formData.jumlah}
                onChange={handleInputChange}
                placeholder="Masukkan jumlah"
                required
              />
            </div>
            <div>
              <label htmlFor="jenisPembayaran" className="block text-sm font-medium">
                Jenis Pembayaran
              </label>
              <Select onValueChange={handleSelectChange} value={formData.jenisPembayaran} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tunai">Tunai</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
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
              <TableHead>Nama</TableHead>
              <TableHead>Jenis Pembayaran</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donatur.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.jenis_pembayaran}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {formatRupiah(parseInt(item.jumlah))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-bold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatRupiah(totalJumlah)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}