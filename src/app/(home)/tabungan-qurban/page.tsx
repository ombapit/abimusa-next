'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell } from 'recharts'

interface QurbanData {
  name: string
  value: number
}

interface PaymentDetail {
  id: number
  tanggal: string
  jumlah: number
  keterangan: string
  metode: string
  bukti_transfer?: string
}

interface Peserta {
  id: number
  nama: string
  total_bayar: number
  sisa: number
  payments?: PaymentDetail[]
}

interface KelompokQurban {
  id: number
  title: string
  target: number
  tercapai: number
  sisa: number
}

interface TabunganQurbanCardProps {
  id: number
  tercapai: number
  sisa: number
  title?: string
  onFetchPeserta: (id: number) => void
}

const COLORS = ['#00C49F', '#f0f0f0']

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Skeleton Card Component for Loading State
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col w-full md:w-fit items-center animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
      <div className="w-[180px] h-[180px] bg-gray-300 rounded-full mb-2"></div>
      <div className="text-center mt-2 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-4 bg-gray-300 rounded w-36"></div>
        <div className="h-4 bg-gray-300 rounded w-28"></div>
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-32 mt-4"></div>
      </div>
    </div>
  )
}

// Image Zoom Modal Component
const ImageZoomModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title 
}: { 
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl font-bold z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
        >
          ×
        </button>
        <div className="text-center">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/files/uploads/${imageUrl}`}
            alt={title}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
          <p className="text-white mt-4 text-lg font-medium">{title}</p>
        </div>
      </div>
    </div>
  )
}

// Modal Component for Payment Details
const PaymentDetailModal = ({ 
  isOpen, 
  onClose, 
  peserta,
  onImageZoom
}: { 
  isOpen: boolean
  onClose: () => void
  peserta: Peserta | null
  onImageZoom?: (imageUrl: string, title: string) => void
}) => {
  if (!isOpen || !peserta) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Detail Pembayaran - {peserta.nama}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Pembayaran</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatRupiah(peserta.total_bayar)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sisa Pembayaran</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatRupiah(peserta.sisa)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jumlah Transaksi</p>
                <p className="text-lg font-semibold text-gray-900">
                  {peserta.payments?.length || 0} kali
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <h3 className="text-lg font-semibold mb-4">Riwayat Pembayaran</h3>
          
          {peserta.payments && peserta.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterangan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bukti Transfer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {peserta.payments.map((payment, index) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.tanggal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatRupiah(payment.jumlah)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {payment.metode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.keterangan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.bukti_transfer ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={`${process.env.NEXT_PUBLIC_BASE_URL}/files/uploads/${payment.bukti_transfer}`}
                              alt={`Bukti transfer ${payment.id}`}
                              className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => onImageZoom?.(payment.bukti_transfer!, `Bukti Transfer - ${formatDate(payment.tanggal)}`)}
                            />
                            <button
                              onClick={() => onImageZoom?.(payment.bukti_transfer!, `Bukti Transfer - ${formatDate(payment.tanggal)}`)}
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              Perbesar
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Tidak ada bukti</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada riwayat pembayaran</p>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

const TabunganQurbanCard = ({ id, tercapai, sisa, title, onFetchPeserta }: TabunganQurbanCardProps) => {
  const data: QurbanData[] = [    
    { name: 'Tercapai', value: tercapai },
    { name: 'Sisa', value: sisa },
  ]
  
  const total = tercapai + sisa
  const percentage = Math.round((tercapai / (tercapai + sisa)) * 100) 

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col w-full md:w-fit items-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <PieChart width={180} height={180}>
        <Pie
          data={data}
          innerRadius={50}
          outerRadius={70}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>
      <div className="text-center mt-2">
        <p className="font-medium">Target: {formatRupiah(total)}</p>
        <p className="font-medium">Uang Masuk: {formatRupiah(tercapai)}</p>
        <p className="font-medium">Sisa: {formatRupiah(sisa)}</p>
        <p className="font-medium text-amber-700">{percentage}% Tercapai</p>
        <button 
          className="px-4 py-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition cursor-pointer"
          onClick={() => onFetchPeserta(id)}
        >
          Detail Peserta
        </button>
      </div>
    </div>
  )
}

export default function TabunganQurban() {
  const [isClient, setIsClient] = useState(false)
  const [peserta, setPeserta] = useState<Peserta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKelompok, setSelectedKelompok] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string>('')
  const [zoomedImageTitle, setZoomedImageTitle] = useState<string>('')
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false)
  
  // State untuk cards dari API
  const [cards, setCards] = useState<KelompokQurban[]>([])
  const [isCardsLoading, setIsCardsLoading] = useState(true)
  const [cardsError, setCardsError] = useState<string>('')
  
  useEffect(() => {
    setIsClient(true)
    fetchKelompokQurban()
  }, [])

  // Fetch data kelompok qurban dari API
  const fetchKelompokQurban = async () => {
    setIsCardsLoading(true)
    setCardsError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tabungan-qurban/kategori`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setCards(data)
      
    } catch (error) {
      console.error('Error fetching kelompok qurban:', error)
      setCardsError('Gagal memuat data kelompok qurban')
      
      // Fallback dengan data dummy
      const dummyCards: KelompokQurban[] = []
      setCards(dummyCards)
      
    } finally {
      setIsCardsLoading(false)
    }
  }

  const openImageZoom = (imageUrl: string, title: string) => {
    setZoomedImage(imageUrl)
    setZoomedImageTitle(title)
    setIsImageZoomOpen(true)
  }

  const closeImageZoom = () => {
    setZoomedImage('')
    setZoomedImageTitle('')
    setIsImageZoomOpen(false)
  }

  const openPaymentDetail = (pesertaData: Peserta) => {
    setSelectedPeserta(pesertaData)
    setIsModalOpen(true)
  }

  const closePaymentDetail = () => {
    setSelectedPeserta(null)
    setIsModalOpen(false)
  }

  const fetchPeserta = async (id: number) => {
    // Scroll to table section
    setTimeout(() => {
      const tableSection = document.getElementById('peserta-section')
      if (tableSection) {
        tableSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 100)

    setIsLoading(true)
    setError('')
    
    try {
      // Simulasi fetch dari API/JSON file
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tabungan-qurban/kategori/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const data = await response.json()
      
      // Simulasi delay untuk menunjukkan loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPeserta(data || [])
      
      // Find the kelompok name from cards
      const selectedCard = cards.find(card => card.id === id)
      setSelectedKelompok(selectedCard?.title || `Kelompok ${id}`)
      
    } catch (err) {
      // Fallback dengan data dummy jika API tidak tersedia
      console.error('Error fetching peserta:', err)
      
      // Data dummy untuk demo dengan payment details
      const dummyData: Peserta[] = [
        {
          id: 1,
          nama: "Ahmad Wijaya",
          total_bayar: 2000000,
          sisa: 23900000,
          payments: [
            {
              id: 1,
              tanggal: "2024-01-15",
              jumlah: 500000,
              keterangan: "Pembayaran cicilan pertama",
              metode: "Transfer Bank",
              bukti_transfer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop"
            },
            {
              id: 2,
              tanggal: "2024-02-15",
              jumlah: 500000,
              keterangan: "Pembayaran cicilan kedua",
              metode: "Cash",
              bukti_transfer: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=600&fit=crop"
            },
            {
              id: 3,
              tanggal: "2024-03-15",
              jumlah: 1000000,
              keterangan: "Pelunasan",
              metode: "Transfer Bank",
              bukti_transfer: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=600&fit=crop"
            }
          ]
        },
        {
          id: 2,
          nama: "Siti Nurhaliza",
          total_bayar: 1500000,
          sisa: 24400000,
          payments: [
            {
              id: 4,
              tanggal: "2024-01-20",
              jumlah: 750000,
              keterangan: "Pembayaran awal",
              metode: "E-Wallet",
              bukti_transfer: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=600&fit=crop"
            },
            {
              id: 5,
              tanggal: "2024-02-20",
              jumlah: 750000,
              keterangan: "Cicilan kedua",
              metode: "Transfer Bank",
              bukti_transfer: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=600&fit=crop"
            }
          ]
        }
      ]
      
      setPeserta(dummyData)
      
      // Find the kelompok name from cards
      const selectedCard = cards.find(card => card.id === id)
      setSelectedKelompok(selectedCard?.title || `Kelompok ${id}`)
      
    } finally {
      setIsLoading(false)      
    }
  }

  if (!isClient) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <main className="mx-auto p-4 mt-15">
      <h1 className="font-bold text-2xl mb-2">Tabungan Qurban 2025-2026</h1>
      
      {/* Error State for Cards */}
      {cardsError && (
        <div className="mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            <p>{cardsError}</p>
            <button
              onClick={fetchKelompokQurban}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-4 mx-auto">        
        {isCardsLoading ? (
          // Skeleton loading untuk cards
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : (
          // Render cards dari API
          cards.map((card) => (
            <TabunganQurbanCard
              key={card.id}
              id={card.id}
              tercapai={card.tercapai}
              sisa={card.sisa}
              title={card.title}
              onFetchPeserta={fetchPeserta}
            />
          ))
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div id="peserta-section" className="mt-8">
          <h2 className="font-bold text-2xl mb-4">List Peserta {selectedKelompok}</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Memuat data peserta...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div id="peserta-section" className="mt-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Table Peserta */}
      {!isLoading && peserta.length > 0 && (
        <div id="peserta-section" className="my-8">
          <h2 className="font-bold text-2xl mb-4">List Peserta {selectedKelompok}</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Bayar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sisa Bayar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail Pembayaran
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {peserta.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openPaymentDetail(item)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {item.nama}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRupiah(item.total_bayar)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRupiah(item.sisa)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openPaymentDetail(item)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={isModalOpen}
        onClose={closePaymentDetail}
        peserta={selectedPeserta}
        onImageZoom={openImageZoom}
      />

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isImageZoomOpen}
        onClose={closeImageZoom}
        imageUrl={zoomedImage}
        title={zoomedImageTitle}
      />
    </main>
  )
}