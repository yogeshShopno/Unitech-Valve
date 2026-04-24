const Client = require('../models/Client');

const getAllClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Client.countDocuments();
    const clients = await Client.find().skip(skip).limit(limit).sort({ createdAt: -1 });

    res.json({
      clients,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createClient = async (req, res) => {
  const client = new Client({
    id: req.body.id,
    name: req.body.name,
    contact: req.body.contact,
    quotes: req.body.quotes || 0,
    status: req.body.status || 'Active',
    statusColor: req.body.statusColor || 'bg-green-100 text-green-800',
    address: req.body.address,
    gstin: req.body.gstin,
    phone: req.body.phone,
    email: req.body.email,
    referencePerson: req.body.referencePerson,
  });

  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};