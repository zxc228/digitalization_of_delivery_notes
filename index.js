require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const app = express();

const userRoutes = require('./routes/user');
const clientRoutes = require('./routes/client');
const projectRoutes = require('./routes/project');
const deliveryNoteRoutes = require('./routes/deliverynote');

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/uploads', express.static('uploads'));


app.use('/api/client', clientRoutes);

app.use('/api/project', projectRoutes);

app.use('/api/deliverynote', deliveryNoteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});