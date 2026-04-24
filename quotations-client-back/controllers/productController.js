const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 });

    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      unit: req.body.unit || 'PCS',
      unitPrice: req.body.unitPrice,
      hsnCode: req.body.hsnCode,
      valveSize: req.body.valveSize,
      image: imageUrl,
    });
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    // If a new file was uploaded, delete the old image file
    if (req.file && existing.image) {
      const oldPath = path.join(__dirname, '..', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updateData = {
      name: req.body.name ?? existing.name,
      description: req.body.description ?? existing.description,
      unit: req.body.unit ?? existing.unit,
      unitPrice: req.body.unitPrice ?? existing.unitPrice,
      hsnCode: req.body.hsnCode ?? existing.hsnCode,
      valveSize: req.body.valveSize ?? existing.valveSize,
    };

    // Handle image: new file uploaded → use it; clearImage flag → remove; else keep existing
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.clearImage === 'true') {
      if (existing.image) {
        const oldPath = path.join(__dirname, '..', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = '';
    } else {
      updateData.image = existing.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete image file from disk
    if (product.image) {
      const imgPath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
