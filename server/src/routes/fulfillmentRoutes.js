const express = require('express');
const router = express.Router();
const {
  getInventoryList,
  getFulfillmentList,
  getFulfillmentDetail,
  confirmSplit,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} = require('../controllers/fulfillmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/inventory', getInventoryList);
router.get('/warehouses', getWarehouses);
router.post('/warehouses', protect, authorize('admin', 'finance'), createWarehouse);
router.put('/warehouses/:id', protect, authorize('admin', 'finance'), updateWarehouse);
router.patch('/warehouses/:id', protect, authorize('admin', 'finance'), updateWarehouse);
router.delete('/warehouses/:name', protect, authorize('admin', 'finance'), deleteWarehouse);

router.route('/')
  .get(getFulfillmentList);

router.route('/:id')
  .get(getFulfillmentDetail);

router.post('/:id/confirm-split', protect, confirmSplit);

module.exports = router;
