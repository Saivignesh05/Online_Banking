const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const controller = require('../controllers/manager.controller');

// Only Branch Head (Role 1) can manage Managers
router.get('/', auth, authorize(1), controller.getAll);
router.post('/', auth, authorize(1), controller.create);

module.exports = router;
