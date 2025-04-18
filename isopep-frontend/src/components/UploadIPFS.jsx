import React, { useState } from 'react';
import { Box, Button, Typography, Input } from '@mui/material';
import { uploadToIPFS } from '../utils/ipfs';

export default function UploadIPFS({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      const cid = await uploadToIPFS(file);
      setHash(cid);
      if (onUploaded) onUploaded(cid);
    } catch (error) {
      console.error('IPFS upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Input type="file" onChange={handleFileChange} />
      <Button variant="contained" sx={{ ml: 2 }} disabled={!file || loading} onClick={handleUpload}>
        {loading ? 'Uploading...' : 'Upload to IPFS'}
      </Button>
      {hash && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Uploaded: <a href={`https://ipfs.io/ipfs/${hash}`} target="_blank" rel="noreferrer">{hash}</a>
        </Typography>
      )}
    </Box>
)};