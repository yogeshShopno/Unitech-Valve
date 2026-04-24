const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', masterController.getMaster);
router.put('/', auth, upload.single('logo'), masterController.updateMaster);

module.exports = router;
