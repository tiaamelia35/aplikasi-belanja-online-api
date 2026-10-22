
const express = require('express');

const app = express();
const PORT = 3000;

// Agar server dapat membaca data JSON dari request
app.use(express.json());

// Data produk sementara
let produk = [
    {
        id: 1,
        nama: 'Handphone',
        harga: 3000000,
        stok: 10
    },
    {
        id: 2,
        nama: 'Headset',
        harga: 150000,
        stok: 20
    },
    {
        id: 3,
        nama: 'Mouse',
        harga: 75000,
        stok: 15
    }
];

// Endpoint untuk memeriksa server
app.get('/', (req, res) => {
    res.json({
        pesan: 'API Aplikasi Belanja Online berhasil dijalankan'
    });
});

// GET: Menampilkan semua produk
// GET: Menampilkan semua produk
app.get('/produk', (req, res) => {
    res.status(200).json(produk);
});

// GET: Menampilkan satu produk berdasarkan ID
app.get('/produk/:id', (req, res) => {
    const id = Number(req.params.id);
    const dataProduk = produk.find(item => item.id === id);

    if (!dataProduk) {
        return res.status(404).json({
            pesan: 'Produk tidak ditemukan'
        });
    }

    res.status(200).json(dataProduk);
});


/* POST: Menambahkan produk */
app.post('/produk', (req, res) => {
    const { nama, harga, stok } = req.body;

    const produkBaru = {
        id: produk.length > 0
            ? Math.max(...produk.map(item => item.id)) + 1
            : 1,
        nama,
        harga,
        stok
    };

    produk.push(produkBaru);

    res.status(201).json({
        pesan: 'Produk berhasil ditambahkan',
        data: produkBaru
    });
});

/* PUT: Mengubah produk */
app.put('/produk/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = produk.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            pesan: 'Produk tidak ditemukan'
        });
    }

    produk[index] = {
        ...produk[index],
        ...req.body,
        id
    };

    res.status(200).json({
        pesan: 'Produk berhasil diubah',
        data: produk[index]
    });
});

/* DELETE: Menghapus produk */
app.delete('/produk/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = produk.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            pesan: 'Produk tidak ditemukan'
        });
    }

    const produkDihapus = produk.splice(index, 1);

    res.status(200).json({
        pesan: 'Produk berhasil dihapus',
        data: produkDihapus[0]
    });
});


// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
