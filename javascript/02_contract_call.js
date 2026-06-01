#!/usr/bin/env node
/**
 * Example 2 — QVM contract call (qweb3.js)
 *
 * Read from and write to a QRC20 token on the Quantova Virtual Machine. The QVM
 * uses the standard Solidity ABI (keccak-256 selectors), so this is identical to
 * EVM tooling — only the transaction signature is post-quantum.
 *
 * Run:
 *   export QUANTOVA_RPC=http://127.0.0.1:9933
 *   node 02_contract_call.js
 *
 * In a full app with qweb3.js installed:
 *   const { QWeb3 } = require('qweb3.js');
 *   const q = new QWeb3(process.env.QUANTOVA_RPC);
 *   const token = q.contract(QRC20_ABI, TOKEN);
 *   const bal = await token.call('balanceOf', [HOLDER]);         // decoded automatically
 *   const data = token.encode('transfer', [HOLDER, 25n * 10n**18n]);
 *   AbiCodec.functionSelector('transfer(address,uint256)')        // '0xa9059cbb'
 */
'use strict';
const { rpc, num, banner } = require('./_common');

const TOKEN = '0xC0ffee254729296a45a3885639AC7E10F9d54979';
const HOLDER = '0x1111111111111111111111111111111111111111';

// keccak-256 selectors/topics (qweb3.js computes these via AbiCodec; shown as
// constants here so the example runs without a keccak dependency).
const SEL_BALANCE_OF = '0x70a08231'; // balanceOf(address)
const SEL_TRANSFER = '0xa9059cbb';   // transfer(address,uint256)
const TOPIC_TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

function pad32(hexNo0x) { return hexNo0x.replace(/^0x/, '').padStart(64, '0'); }

async function main() {
  banner('Quantova example: QVM contract call (QRC20) (qweb3.js)');
  console.log(`Connected. Block: ${num(await rpc('q_blockNumber'))}`);
  console.log(`Token contract: ${TOKEN}`);
  console.log(`selector transfer(address,uint256): ${SEL_TRANSFER}`);
  console.log(`topic    Transfer(address,address,uint256): ${TOPIC_TRANSFER.slice(0, 18)}…`);

  // read: balanceOf(HOLDER) via q_call
  const callData = SEL_BALANCE_OF + pad32(HOLDER);
  const ret = await rpc('q_call', [{ to: TOKEN, data: callData }]);
  const bal = BigInt(ret);
  console.log(`\nbalanceOf(${HOLDER.slice(0, 10)}…) = ${bal}  (= ${bal / 10n ** 18n} tokens)`);

  // write: transfer 25 tokens -> calldata
  const amount = 25n * 10n ** 18n;
  const data = SEL_TRANSFER + pad32(HOLDER) + pad32(amount.toString(16));
  console.log(`\nWrite: transfer 25 tokens`);
  console.log(`calldata: 0x${data.slice(0, 38)}…`);
  console.log('In qweb3.js the wallet post-quantum-signs this calldata, then broadcasts.');

  const txHash = await rpc('q_sendRawTransaction', ['0x' + data]);
  console.log(`Broadcast! tx hash: ${txHash}`);
  const rcpt = await rpc('q_getTransactionReceipt', [txHash]);
  console.log(`status: ${rcpt.status}  gasUsed: ${num(rcpt.gasUsed)}`);
}

main().catch((e) => { console.error('error:', e.message); process.exit(1); });
