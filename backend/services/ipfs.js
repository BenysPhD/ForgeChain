// backend/services/ipfs.js
require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const pinata    = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET,
  { pinataOptions: { cidVersion: 1 } }
);

/**
 * Pin un objet JSON sur IPFS via Pinata et renvoie le CID.
 * @param {Object} jsonData – Les données JSON à pinner.
 * @returns {Promise<string>} – Le CID IPFS (hash).
 */
async function pinJSONToIPFS(jsonData) {
  try {
    const result = await pinata.pinJSONToIPFS(jsonData, {
      pinataMetadata: {
        name: jsonData.name || 'supplier-allocation-metrics',
        keyvalues: jsonData.meta || {}
      }
    });
    console.log(`✅ Pinned JSON to IPFS: ${result.IpfsHash}`);
    return result.IpfsHash;
  } catch (err) {
    console.error('❌ Failed to pin JSON to IPFS:', err);
    throw err;
  }
}

module.exports = { pinJSONToIPFS };
