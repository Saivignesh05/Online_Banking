// ─── Loan Routes ────────────────────────────────────────────────
const router     = require('express').Router();
const auth       = require('../middleware/auth');
const authorize  = require('../middleware/role');
const controller = require('../controllers/loan.controller');

router.get('/',               auth, controller.getAll);
router.get('/:id',            auth, controller.getById);
router.post('/',              auth, authorize(4), controller.apply);
router.put('/:id/provide-options', auth, authorize(3), controller.provideOptions);
router.get('/:id/options',    auth, controller.getOptions);
router.put('/:id/confirm-option', auth, authorize(4), controller.confirmOption);
router.put('/:id/reject',     auth, authorize(4), controller.reject);
router.get('/:id/emi',        auth, controller.calculateEmi);
router.get('/:id/payments',   auth, controller.getPayments);
router.post('/:id/payments',  auth, authorize(4), controller.recordPayment);

module.exports = router;
