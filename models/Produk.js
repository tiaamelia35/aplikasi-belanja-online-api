
const mongoose = require('mongoose');

const produkSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true
    },
    harga: {
        type: Number,
        required: true,
        min: 0
    },
    stok: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = mongoose.model('Produk', produkSchema);
