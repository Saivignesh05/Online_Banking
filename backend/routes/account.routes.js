// ─── Account Routes ─────────────────────────────────────────────
const router     = require('express').Router();
const auth       = require('../middleware/auth');
const authorize  = require('../middleware/role');
const controller = require('../controllers/account.controller');

router.get('/',             auth, controller.getAll);
router.get('/:id',          auth, controller.getById);
router.post('/',            auth, authorize(3), controller.create);
router.post('/request',     auth, controller.requestAccount);
router.put('/:id',          auth, authorize(3), controller.update);
router.put('/:id/approve',  auth, authorize(3), controller.approveAccount);
router.put('/:id/reject',   auth, authorize(3), controller.rejectAccount);
router.get('/:id/balance',  auth, controller.getBalance);

module.exports = router;
