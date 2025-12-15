const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio Backend API is running!' });
});

// Routes
const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});