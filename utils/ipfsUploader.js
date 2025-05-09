// utils/ipfsUploader.js
const { IPFS_API_URL, IPFS_GATEWAY_URL } = process.env;
const path   = require('path');
const fs     = require('fs');
const axios  = require('axios');
const FormData = require('form-data');


async function uploadIPFS(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), path.basename(filePath));

  const { data } = await axios.post(
    `${IPFS_API_URL}/api/v0/add`,
    form,
    { headers: form.getHeaders(), maxBodyLength: Infinity }
  );

  // data: { Name, Hash, Size }
  return `${IPFS_GATEWAY_URL}/${data.Hash}`;
}

module.exports = uploadIPFS;