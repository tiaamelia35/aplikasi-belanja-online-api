
const express = require('express');
const router = express.Router();

const {
    getAllProduk,
    getProdukById,
    createProduk,
    updateProduk,
    deleteProduk
} = require('../controllers/produkController');

// GET: Menampilkan semua produk
router.get('/', getAllProduk);

// GET: Menampilkan satu produk berdasarkan ID
router.get('/:id', getProdukById);

// POST: Menambahkan produk
router.post('/', createProduk);

// PUT: Mengubah produk
router.put('/:id', updateProduk);

// DELETE: Menghapus produk
router.delete('/:id', deleteProduk);

module.exports = router;
