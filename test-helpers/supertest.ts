import { AddressInfo } from 'net';
import http from 'http';
import type { Express } from 'express';

function makeRequest(app: Express, method: string, path: string, body?: any) {
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      const options = {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          server.close();
          resolve({ status: res.statusCode || 0, body: data ? JSON.parse(data) : {} });
        });
      });
      req.on('error', err => {
        server.close();
        reject(err);
      });
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

export default function request(app: Express) {
  return {
    get: (p: string) => ({ send: () => makeRequest(app, 'GET', p) }),
    post: (p: string) => ({ send: (b: any) => makeRequest(app, 'POST', p, b) }),
  };
}
