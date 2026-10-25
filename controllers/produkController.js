
const mongoose = require('mongoose');
const Produk = require('../models/Produk');

// GET: Menampilkan produk dengan filtering, pagination,
// sorting, dan projection
const getAllProduk = async (req, res, next) => {
    try {
        const {
            nama, minHarga, maxHarga, minStok, maxStok,
            sortBy, order, page, limit, fields
        } = req.query;

        // Validasi parameter angka untuk filtering
        const parameterAngka = [
            'minHarga', 'maxHarga', 'minStok', 'maxStok'
        ];

        for (const parameter of parameterAngka) {
            const nilai = req.query[parameter];

            if (
                nilai !== undefined &&
                (
                    nilai.trim() === '' ||
                    !Number.isFinite(Number(nilai)) ||
                    Number(nilai) < 0
                )
            ) {
                const error = new Error(
                    `Parameter ${parameter} harus berupa angka positif atau nol`
                );
                error.status = 400;
                throw error;
            }
        }

        if (
            minHarga !== undefined &&
            maxHarga !== undefined &&
            Number(minHarga) > Number(maxHarga)
        ) {
            const error = new Error(
                'minHarga tidak boleh lebih besar dari maxHarga'
            );
            error.status = 400;
            throw error;
        }

        if (
            minStok !== undefined &&
            maxStok !== undefined &&
            Number(minStok) > Number(maxStok)
        ) {
            const error = new Error(
                'minStok tidak boleh lebih besar dari maxStok'
            );
            error.status = 400;
            throw error;
        }

        // Validasi pagination
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
                throw error;
            }
        }

        const halaman = Number(page) || 1;
        const batas = Math.min(100, Number(limit) || 10);

        // FILTERING
        const filter = {};

        if (nama) {
            filter.nama = { $regex: nama, $options: 'i' };
        }

        if (minHarga !== undefined || maxHarga !== undefined) {
            filter.harga = {};

            if (minHarga !== undefined) {
                filter.harga.$gte = Number(minHarga);
            }

            if (maxHarga !== undefined) {
                filter.harga.$lte = Number(maxHarga);
            }
        }

        if (minStok !== undefined || maxStok !== undefined) {
            filter.stok = {};

            if (minStok !== undefined) {
                filter.stok.$gte = Number(minStok);
            }

            if (maxStok !== undefined) {
                filter.stok.$lte = Number(maxStok);
            }
        }

        // SORTING
        const fieldDiizinkan = ['nama', 'harga', 'stok', '_id'];
        const pengurutan = {};

        if (sortBy) {
            if (!fieldDiizinkan.includes(sortBy)) {
                const error = new Error(
                    'sortBy harus nama, harga, atau stok'
                );
                error.status = 400;
                throw error;
            }

            if (order !== undefined && !['asc', 'desc'].includes(order)) {
                const error = new Error(
                    'order harus asc atau desc'
                );
                error.status = 400;
                throw error;
            }

            pengurutan[sortBy] = order === 'desc' ? -1 : 1;
        }

        // PROJECTION
        let pilihanField = '';

        if (fields) {
            const fieldProyeksiDiizinkan = ['nama', 'harga', 'stok'];
            const fieldDiminta = fields.split(',').map(
                field => field.trim()
            );

            if (
                fieldDiminta.some(
                    field => !fieldProyeksiDiizinkan.includes(field)
                )
            ) {
                const error = new Error(
                    'fields hanya boleh berisi nama, harga, stok'
                );
                error.status = 400;
                throw error;
            }

            pilihanField = [...new Set(fieldDiminta)].join(' ');
        }

        // Hitung total data
        const totalData = await Produk.countDocuments(filter);

        // Ambil data produk
        let query = Produk.find(filter);

        if (pilihanField) {
            query = query.select(pilihanField);
        }

        if (Object.keys(pengurutan).length > 0) {
            query = query.sort(pengurutan);
        }

        const data = await query
            .skip((halaman - 1) * batas)
            .limit(batas)
            .exec();

        res.status(200).json({
            halaman,
            batasData: batas,
            totalData,
            totalHalaman: Math.ceil(totalData / batas),
            data
        });
    } catch (error) {
        next(error);
    }
};

// GET: Menampilkan satu produk berdasarkan ID
const getProdukById = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            const error = new Error('ID produk tidak valid');
            error.status = 400;
            throw error;
        }

        const dataProduk = await Produk.findById(id);

        if (!dataProduk) {
            const error = new Error('Produk tidak ditemukan');
            error.status = 404;
            throw error;
        }

        res.status(200).json(dataProduk);
    } catch (error) {
        next(error);
    }
};

// POST: Menambahkan produk
const createProduk = async (req, res, next) => {
    try {
        const { nama, harga, stok } = req.body;

        if (
            typeof nama !== 'string' ||
            nama.trim() === '' ||
            harga === undefined ||
            stok === undefined ||
            !Number.isFinite(harga) ||
            !Number.isFinite(stok) ||
            harga < 0 ||
            stok < 0
        ) {
            const error = new Error(
                'nama harus berupa teks, sedangkan harga dan stok harus berupa angka nol atau lebih'
            );
            error.status = 400;
            throw error;
        }

        const produkBaru = await Produk.create({
            nama: nama.trim(),
            harga,
            stok
        });

        res.status(201).json({
            pesan: 'Produk berhasil ditambahkan',
            data: produkBaru
        });
    } catch (error) {
        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            error.status = 400;
        }

        next(error);
    }
};

// PUT: Mengubah produk
const updateProduk = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { nama, harga, stok } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            const error = new Error('ID produk tidak valid');
            error.status = 400;
            throw error;
        }

        if (
            (nama !== undefined &&
                (typeof nama !== 'string' || nama.trim() === '')) ||
            (harga !== undefined &&
                (!Number.isFinite(harga) || harga < 0)) ||
            (stok !== undefined &&
                (!Number.isFinite(stok) || stok < 0))
        ) {
            const error = new Error(
                'Data nama, harga, atau stok tidak valid'
            );
            error.status = 400;
            throw error;
        }

        const dataUpdate = {};

        if (nama !== undefined) dataUpdate.nama = nama.trim();
        if (harga !== undefined) dataUpdate.harga = harga;
        if (stok !== undefined) dataUpdate.stok = stok;

        if (Object.keys(dataUpdate).length === 0) {
            const error = new Error(
                'Minimal satu data produk harus dikirim untuk diubah'
            );
            error.status = 400;
            throw error;
        }

        const produkDiubah = await Produk.findByIdAndUpdate(
            id,
            { $set: dataUpdate },
            { new: true, runValidators: true }
        );

        if (!produkDiubah) {
            const error = new Error('Produk tidak ditemukan');
            error.status = 404;
            throw error;
        }

        res.status(200).json({
            pesan: 'Produk berhasil diubah',
            data: produkDiubah
        });
    } catch (error) {
        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            error.status = 400;
        }

        next(error);
    }
};

// DELETE: Menghapus produk
const deleteProduk = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            const error = new Error('ID produk tidak valid');
            error.status = 400;
            throw error;
        }

        const produkDihapus = await Produk.findByIdAndDelete(id);

        if (!produkDihapus) {
            const error = new Error('Produk tidak ditemukan');
            error.status = 404;
            throw error;
        }

        res.status(200).json({
            pesan: 'Produk berhasil dihapus',
            data: produkDihapus
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProduk,
    getProdukById,
    createProduk,
    updateProduk,
    deleteProduk
};
