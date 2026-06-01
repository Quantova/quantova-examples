/**
 * Shared configuration and helpers for the Quantova JavaScript examples.
 *
 * Point QUANTOVA_RPC at any endpoint:
 *   export QUANTOVA_RPC=https://testnet.quantova.io   # public testnet
 *   export QUANTOVA_RPC=http://127.0.0.1:9933          # local node (default)
 *
 * These examples use the same Quantova endpoints and patterns as qweb3.js. In a
 * full app you use the QWeb3 facade directly (see the README); here a tiny
 * JSON-RPC helper is included so the examples run without installing the native
 * @quantova WASM packages, while the qweb3.js API shape is shown in comments.
 */
'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

const RPC_URL = process.env.QUANTOVA_RPC || 'http://127.0.0.1:9933';
const DECIMALS = 18n;
const PLANCK = 10n ** DECIMALS;

let _id = 1;
function rpc(method, params = [], url = RPC_URL) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: _id++, method, params });
  const u = new URL(url);
  const lib = u.protocol === 'https:' ? https : http;
  const opts = { method: 'POST', hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80),
    path: u.pathname, headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) } };
  return new Promise((resolve, reject) => {
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.error) return reject(new Error(j.error.message || JSON.stringify(j.error)));
          resolve(j.result);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const num = (v) => (typeof v === 'string' && v.startsWith('0x') ? parseInt(v, 16) : Number(v));
const big = (v) => (typeof v === 'string' && v.startsWith('0x') ? BigInt(v) : BigInt(v));
function toQtov(planck) {
  const p = big(planck);
  const whole = p / PLANCK;
  const frac = (p % PLANCK).toString().padStart(18, '0').replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : `${whole}`;
}
const toPlanck = (qtov) => BigInt(Math.round(Number(qtov) * 1e6)) * (PLANCK / 1000000n);

function banner(title) {
  const line = '='.repeat(64);
  console.log(line);
  console.log('  ' + title);
  console.log(line);
}

module.exports = { rpc, num, big, toQtov, toPlanck, banner, RPC_URL, PLANCK };
