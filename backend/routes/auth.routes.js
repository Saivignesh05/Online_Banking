// ─── Auth Routes ────────────────────────────────────────────────
const router       = require('express').Router();
const auth         = require('../middleware/auth');
const controller   = require('../controllers/auth.controller');

router.post('/apply', controller.apply);
router.post('/login',    controller.login);
router.get('/me',        auth, controller.getMe);

module.exports = router;
