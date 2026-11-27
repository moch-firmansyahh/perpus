import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT || 8000);

const server = app.listen(PORT, () => {
  console.log(`Smart Campus Library API berjalan pada port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`Menerima ${signal}, menutup server dengan aman...`);
  server.close(() => {
    console.log('Server ditutup.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Shutdown paksa setelah timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
