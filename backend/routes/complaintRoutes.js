const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin, sweeper } = require('../middleware/authMiddleware');
const {
  createComplaint,
  getComplaints,
  assignSweeper,
  updateStatus,
  getAnalytics,
  getSweepers
} = require('../controllers/complaintController');

router.route('/')
  .post(protect, upload.single('image'), createComplaint)
  .get(protect, getComplaints);

router.get('/analytics', protect, admin, getAnalytics);
router.get('/sweepers', protect, admin, getSweepers);

router.put('/:id/assign', protect, admin, assignSweeper);
router.put('/:id/status', protect, sweeper, upload.single('afterImage'), updateStatus);

module.exports = router;
