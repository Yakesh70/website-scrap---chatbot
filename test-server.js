const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test server working' });
});

app.post('/api/links/upload', (req, res) => {
  console.log('Upload request received:', req.body);
  res.json({ success: true, message: 'Upload endpoint reached' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});