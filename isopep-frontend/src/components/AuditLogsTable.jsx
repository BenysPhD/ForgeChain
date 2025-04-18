import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

export default function AuditLogsTable({ logs }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell>Tx Hash</TableCell>
            <TableCell>Block</TableCell>
            <TableCell>Args</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log, idx) => (
            <TableRow key={idx}>
              <TableCell><Chip label={log.eventName} color="primary" /></TableCell>
              <TableCell>
                <a href={`https://sepolia.etherscan.io/tx/${log.txHash}`} target="_blank" rel="noreferrer">
                  {log.txHash.slice(0, 10)}...
                </a>
              </TableCell>
              <TableCell>{log.blockNumber}</TableCell>
              <TableCell>
                {log.args.map((arg, i) => (
                  <div key={i}>{typeof arg === 'object' ? JSON.stringify(arg) : arg.toString()}</div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
