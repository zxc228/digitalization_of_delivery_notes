require('dotenv').config();
const express = require('express');
const app = express();

const userRoutes = require('./routes/user');

app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});