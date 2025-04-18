//  Composant TestButton pour IPFS (src/components/TestButton.jsx)
import React, { useState } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import { uploadToIPFS } from '../utils/ipfs';

export default function TestButton() {
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState(null);

  async function handleUpload() {
    setLoading(true);
    try {
      const file = new Blob(["Test IPFS upload from ForgeChain"], { type: 'text/plain' });
      const result = await uploadToIPFS(file);
      setCid(result);
    } catch (err) {
      console.error("IPFS upload error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-6">
      <Button variant="contained" onClick={handleUpload} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : "📤 Test IPFS Upload"}
      </Button>
      {cid && (
        <Typography variant="body2" sx={{ mt: 2 }}>
         Uploaded: <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noreferrer">{cid}</a>
        </Typography>
      )}
    </div>
  );
}
