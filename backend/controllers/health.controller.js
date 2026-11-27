import os from 'node:os';

export const getHealth = (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
    instance: os.hostname(),
  });
};
