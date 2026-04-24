const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientsController');
const auth = require('../middleware/auth');

// GET all clients
router.get('/', auth, clientController.getAllClients);

// GET single client
router.get('/:id', auth, clientController.getClientById);

// POST create client
router.post('/', auth, clientController.createClient);

// PUT update client
router.put('/:id', auth, clientController.updateClient);

// DELETE client
router.delete('/:id', auth, clientController.deleteClient);

module.exports = router;