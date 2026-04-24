const Master = require('../models/Master');

const getMaster = async (req, res) => {
  try {
    let master = await Master.findOne();
    if (!master) {
      // Create a default one if it doesn't exist
      master = new Master({
        companyName: 'Your Company Name',
        address: '',
        website: '',
        email: '',
        logo: '',
        termsAndConditions: '',
        hsnCode: ''
      });
      await master.save();
    }
    res.json(master);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMaster = async (req, res) => {
  try {
    let master = await Master.findOne();
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    if (!master) {
      master = new Master(updateData);
    } else {
      Object.assign(master, updateData);
    }
    await master.save();
    res.json(master);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getMaster,
  updateMaster
};
