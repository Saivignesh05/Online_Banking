const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const controller = require('../controllers/application.controller');

// Only Employees and Managers can view/approve applications (Role 1, 2, 3)
router.get('/', auth, authorize(3), controller.getApplications);
router.put('/:id/approve', auth, authorize(3), controller.approveApplication);
router.put('/:id/reject', auth, authorize(3), controller.rejectApplication);

module.exports = router;
