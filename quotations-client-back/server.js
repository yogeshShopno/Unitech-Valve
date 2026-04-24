require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const Admin = require('./models/Admin');
const Client = require('./models/Client');
const Product = require('./models/Product');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');


const app = express();

app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Seed default admin
const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const admin = new Admin({ username: 'admin', password: hashedPassword });
      await admin.save();
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
};

// Seed sample clients
const seedClients = async () => {
  try {
    const clientCount = await Client.countDocuments();
    if (clientCount === 0) {
      const clients = [
        {
          id: 'CLI001',
          name: 'ABC Corporation',
          contact: 'john.doe@abc.com',
          address: '123 Business St, City, State 12345',
          gstin: '22AAAAA0000A1Z5',
          phone: '+91 9876543210'
        },
        {
          id: 'CLI002',
          name: 'XYZ Industries',
          contact: 'jane.smith@xyz.com',
          address: '456 Industrial Ave, City, State 67890',
          gstin: '33BBBBB1111B2Y6',
          phone: '+91 9876543211'
        },
        {
          id: 'CLI003',
          name: 'Tech Solutions Ltd',
          contact: 'mike.johnson@techsol.com',
          address: '789 Tech Park, City, State 54321',
          gstin: '44CCCCC2222C3X7',
          phone: '+91 9876543212'
        }
      ];
      await Client.insertMany(clients);
      console.log('Sample clients created');
    }
  } catch (err) {
    console.error('Error seeding clients:', err);
  }
};

// Seed sample products
const seedProducts = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        {
          name: 'Widget A',
          description: 'High-quality widget for industrial use',
          unit: 'PCS',
          unitPrice: 1500,
          hsnCode: '8482'
        },
        {
          name: 'Gadget B',
          description: 'Advanced gadget with modern features',
          unit: 'PCS',
          unitPrice: 2500,
          hsnCode: '8542'
        },
        {
          name: 'Tool C',
          description: 'Precision tool for engineering work',
          unit: 'PCS',
          unitPrice: 800,
          hsnCode: '8205'
        },
        {
          name: 'Component D',
          description: 'Essential component for assemblies',
          unit: 'PCS',
          unitPrice: 300,
          hsnCode: '8536'
        }
      ];
      await Product.insertMany(products);
      console.log('Sample products created');
    }
  } catch (err) {
    console.error('Error seeding products:', err);
  }
};

seedAdmin();
seedClients();
seedProducts();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.1.132:3000', 'http://192.168.1.132:3001', "https://unitech-valve.vercel.app/"],
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());

// Routes
const clientRoutes = require('./routes/clients');
const adminRoutes = require('./routes/admin');
const masterRoutes = require('./routes/master');
const quotationRoutes = require('./routes/quotations');
const productRoutes = require('./routes/productRoutes');
const proformaInvoiceRoutes = require('./routes/proformaInvoices');
const purchasePartyRoutes = require('./routes/purchaseParties');
const purchaseOrderRoutes = require('./routes/purchaseOrders');

app.use('/api/clients', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/proforma-invoices', proformaInvoiceRoutes);
app.use('/api/purchase-parties', purchasePartyRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});