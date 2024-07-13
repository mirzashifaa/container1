const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 6000;

app.use(express.json());

app.post('/store-file', (req, res) => {
  const { file, data } = req.body;

  if (!file || !data || data==undefined) {
    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  const filePath = `/app/shifa_PV_dir/${file}`; 
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      return res.status(500).json({ file, error: 'Error while storing the file to the storage.' });
    }
    return res.json({ file, message: 'Success.' });
  });
});


app.post('/calculate', async (req, res) => {
  try {
    const { file, product } = req.body;

    if (!file || !product) {
      return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }
  
    const filePath = `/app/shifa_PV_dir/${file}`;

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ file, error: 'File not found.' });
    }

    const response = await axios.post('http://container2-service:6001/calculate', { file, product });
    return res.json(response.data);
  } catch (error) {
    console.log('Error:', error);
    return res.status(500).json({ file: error.response.data.file, error: error.response.data.error});
  }
});

app.listen(port, () => {
  if (!fs.existsSync('/app/shifa_PV_dir')){
    fs.mkdirSync('/app/shifa_PV_dir');
  }
  console.log(`Container 1 listening at http://localhost:${port}`);
});
