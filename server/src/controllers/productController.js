const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all products in catalog (filter active vs archived)
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (status === 'archived') {
      filter.isActive = false;
    } else if (status === 'all') {
      // no isActive filter
    } else {
      filter.isActive = true;
    }
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    return sendSuccess(res, products, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');

const findProductByIdOrSku = async (idOrSku) => {
  if (mongoose.Types.ObjectId.isValid(idOrSku)) {
    const product = await Product.findById(idOrSku);
    if (product) return product;
  }
  return await Product.findOne({
    $or: [{ sku: idOrSku.toUpperCase() }, { sku: idOrSku }, { name: idOrSku }]
  });
};

// @desc    Get single product by ID or SKU
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await findProductByIdOrSku(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, product, 'Product retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing product catalog details & variants
// @route   PUT /api/products/:id or PATCH /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await findProductByIdOrSku(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const updated = await Product.findByIdAndUpdate(
      product._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Archive product (soft-delete preserving historical quotations and invoices)
// @route   PATCH /api/products/:id/archive or DELETE /api/products/:id
const archiveProduct = async (req, res, next) => {
  try {
    const product = await findProductByIdOrSku(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // DATA INTEGRITY RULE: Never hard-delete products. Historical quotations and invoices depend on product foreign keys.
    product.isActive = false;
    await product.save();

    return sendSuccess(res, product, 'Product archived successfully (soft-deleted to preserve quotation/invoice history)');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct
};
