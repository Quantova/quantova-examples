#!/usr/bin/env node
/**
 * Example 1 — Native transfer (qweb3.js)
 *
 * Send TQTOV from one Quantova account to another. Shows connecting, reading a
 * balance and nonce, estimating the fee, and the shape of a post-quantum-signed
 * transfer broadcast.
 *
 * Run:
 *   export QUANTOVA_RPC=http://127.0.0.1:9933   # or https://testnet.quantova.io
 *   node 01_transfer.js
 *
 * In a full app with qweb3.js installed:
 *
 *   const { QWeb3, QuantumWallet } = require('qweb3.js');
 *   const q = new QWeb3(process.env.QUANTOVA_RPC);
 *   const wallet = new QuantumWallet();
 *   const sender = wallet.create('dilithium');             // PQ account, address begins with 'Q'
 *   const txHash = await wallet.buildAndSignTransfer(
 *     { from: sender.address, to: RECIPIENT, value: 1500000000000000000n }, { rpc: q.rpc });
 *
 * This runnable version uses raw JSON-RPC (see _common.js) so it works without the
 * native @quantova WASM packages installed.
 */
'use strict';
const { rpc, num, toQtov, toPlanck, banner } = require('./_common');

const SENDER = 'Q1GRZ4PVL7DGX588TXW4P4MPZCXL7F8FE46HKF5J';     // example Q-address
const RECIPIENT = 'Q1GP3FR9CVK3XAJSQGC7DU47WCDUVTFDYMY0H82C';   // example Q-address
const AMOUNT_QTOV = 1.5;

async function main() {
  banner('Quantova example: native TQTOV transfer (qweb3.js)');
  const block = num(await rpc('q_blockNumber'));
  console.log(`Connected. Current block: ${block}`);

  const bal = await rpc('q_getBalance', [SENDER]);
  const nonce = num(await rpc('q_getTransactionCount', [SENDER]));
  console.log(`Sender:  ${SENDER}`);
  console.log(`Balance: ${toQtov(bal)} TQTOV   nonce: ${nonce}`);

  // fee tiers (qweb3.js: await q.fees.estimate())
  const gasPrice = await rpc('q_gasPrice');
  const tip = await rpc('q_maxPriorityFeePerGas');
  console.log(`Fee:     gasPrice ${num(gasPrice)}  priorityTip ${num(tip)}`);

  const value = toPlanck(AMOUNT_QTOV);
  console.log(`\nTransfer: ${AMOUNT_QTOV} TQTOV -> ${RECIPIENT}  (value ${value} planck)`);
  console.log('In qweb3.js this is built and post-quantum-signed by the wallet, then broadcast.');

  // Demonstrate the broadcast + receipt round-trip via raw RPC:
  const raw = '0x' + Buffer.from(`transfer:${SENDER}->${RECIPIENT}:${value}:nonce=${nonce}`).toString('hex');
  const txHash = await rpc('q_sendRawTransaction', [raw]);
  console.log(`Broadcast! tx hash: ${txHash}`);
  const receipt = await rpc('q_getTransactionReceipt', [txHash]);
  console.log(`Included in block: ${num(receipt.blockNumber)}   status: ${receipt.status}`);
}

main().catch((e) => { console.error('error:', e.message); process.exit(1); });
