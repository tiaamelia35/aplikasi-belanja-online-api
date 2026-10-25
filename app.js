
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const produkRoutes = require('./routes/produkRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk membaca JSON
app.use(express.json());

// Endpoint untuk memeriksa server
app.get('/', (req, res) => {
    res.status(200).json({
        pesan: 'API Aplikasi Belanja Online berhasil dijalankan'
    });
});

// Routes produk
app.use('/produk', produkRoutes);

// Middleware untuk endpoint yang tidak ditemukan
app.use(notFound);

// Middleware error handling terpusat
app.use(errorHandler);

// Koneksi MongoDB Atlas dan menjalankan server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Terhubung ke MongoDB Atlas');

        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            'Gagal terhubung ke MongoDB:',
            error.message
        );
        process.exit(1);
    });
