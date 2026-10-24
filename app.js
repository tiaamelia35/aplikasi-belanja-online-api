
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

 // GET: Menampilkan produk dengan filtering, pagination, sorting, dan projection
app.get('/produk', (req, res, next) => {
    // 1. FILTERING: menyaring data berdasarkan query parameter
    let hasil = [...produk];
    const { nama, minHarga, maxHarga, minStok, maxStok } = req.query;
    
    // Validasi parameter angka untuk filtering
    const parameterAngka = ['minHarga', 'maxHarga', 'minStok', 'maxStok'];

    for (const parameter of parameterAngka) {
        if (
            req.query[parameter] !== undefined &&
            (req.query[parameter].trim() === '' ||
             !Number.isFinite(Number(req.query[parameter])) ||
             Number(req.query[parameter]) < 0)
        ) {
            const error = new Error(
                `Parameter ${parameter} harus berupa angka positif atau nol`
            );
            error.status = 400;
            return next(error);
        }
    }

    // Validasi batas harga dan stok
    if (
        minHarga !== undefined && maxHarga !== undefined &&
        Number(minHarga) > Number(maxHarga)
    ) {
        const error = new Error('minHarga tidak boleh lebih besar dari maxHarga');
        error.status = 400;
        return next(error);
    }

    if (
        minStok !== undefined && maxStok !== undefined &&
        Number(minStok) > Number(maxStok)
    ) {
        const error = new Error('minStok tidak boleh lebih besar dari maxStok');
        error.status = 400;
        return next(error);
    }


    if (nama) {
        hasil = hasil.filter(item =>
            item.nama.toLowerCase().includes(nama.toLowerCase())
        );
    }

    if (minHarga !== undefined) {
        hasil = hasil.filter(item => item.harga >= Number(minHarga));
    }

    if (maxHarga !== undefined) {
        hasil = hasil.filter(item => item.harga <= Number(maxHarga));
    }

    if (minStok !== undefined) {
        hasil = hasil.filter(item => item.stok >= Number(minStok));
    }

    if (maxStok !== undefined) {
        hasil = hasil.filter(item => item.stok <= Number(maxStok));
    }

    // 2. SORTING: mengurutkan data berdasarkan field
    const { sortBy, order } = req.query;

    const fieldDiizinkan = ['id', 'nama', 'harga', 'stok'];

    if (sortBy && fieldDiizinkan.includes(sortBy)) {
        hasil.sort((a, b) => {
            if (typeof a[sortBy] === 'string') {
                return order === 'desc'
                    ? b[sortBy].localeCompare(a[sortBy])
                    : a[sortBy].localeCompare(b[sortBy]);
            }

            return order === 'desc'
                ? b[sortBy] - a[sortBy]
                : a[sortBy] - b[sortBy];
        });
    }

    // 3. PAGINATION: menentukan halaman dan jumlah data
    
    // Validasi parameter pagination
    for (const parameter of ['page', 'limit']) {
        const nilai = req.query[parameter];

        if (
            nilai !== undefined &&
            (!/^\d+$/.test(nilai) || Number(nilai) < 1)
        ) {
            const error = new Error(
                `Parameter ${parameter} harus berupa bilangan bulat positif`
            );
            error.status = 400;
            return next(error);
        }
    }

    const page = Number(req.query.page) || 1;
    const limit = Math.min(100, Number(req.query.limit) || 10);

    const totalData = hasil.length;
    const totalHalaman = Math.ceil(totalData / limit);
    const mulai = (page - 1) * limit;

    hasil = hasil.slice(mulai, mulai + limit);

    // 4. PROJECTION: memilih field yang ditampilkan
    if (req.query.fields) {
        const fieldDiminta = req.query.fields
            .split(',')
            .map(field => field.trim());

        const fieldDiizinkan = ['id', 'nama', 'harga', 'stok'];
        const fieldValid = fieldDiminta.filter(field =>
            fieldDiizinkan.includes(field)
        );

        hasil = hasil.map(item => {
            const data = {};

            fieldValid.forEach(field => {
                data[field] = item[field];
            });

            return data;
        });
    }

    // Response API
    res.status(200).json({
        halaman: page,
        batasData: limit,
        totalData: totalData,
        totalHalaman: totalHalaman,
        data: hasil
    });
});


// GET: Menampilkan satu produk berdasarkan ID

app.get('/produk/:id', (req, res, next) => {
    const id = Number(req.params.id);
    const dataProduk = produk.find(item => item.id === id);

    if (!dataProduk) {
        const error = new Error('Produk tidak ditemukan');
        error.status = 404;
        return next(error);
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

/* PUT: Mengubah produk */
app.put('/produk/:id', (req, res, next) => {
    const id = Number(req.params.id);
    const index = produk.findIndex(item => item.id === id);

    if (index === -1) {
        const error = new Error('Produk tidak ditemukan');
        error.status = 404;
        return next(error);
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

app.delete('/produk/:id', (req, res, next) => {
    const id = Number(req.params.id);
    const index = produk.findIndex(item => item.id === id);

    if (index === -1) {
        const error = new Error('Produk tidak ditemukan');
        error.status = 404;
        return next(error);
    }

    const produkDihapus = produk.splice(index, 1);

    res.status(200).json({
        pesan: 'Produk berhasil dihapus',
        data: produkDihapus[0]
    });
});



 // Menangani endpoint yang tidak ditemukan
app.use((req, res, next) => {
    const error = new Error('Endpoint tidak ditemukan');
    error.status = 404;
    next(error);
});


 // Error Handling Terpusat: middleware menangani seluruh error API
app.use((err, req, res, next) => {
    console.error(err.stack);

    const status = err.status || 500;

    res.status(status).json({
        pesan: err.message || 'Terjadi kesalahan pada server'
    });
});


// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
