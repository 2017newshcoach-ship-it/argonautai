import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'error-logger',
        configureServer(server) {
          server.middlewares.use('/__log_error', (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', () => {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'error_dumps.txt');
                const timestamp = new Date().toISOString();
                const logEntry = `[${timestamp}] ${body}\n---\n`;
                fs.appendFile(logPath, logEntry, (err) => {
                  if (err) console.error("Failed to write log", err);
                });
                res.statusCode = 200;
                res.end('ok');
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
