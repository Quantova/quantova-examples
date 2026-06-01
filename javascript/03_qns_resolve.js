#!/usr/bin/env node
/**
 * Example 3 — QNS .q name resolution (qweb3.js)
 *
 * Resolve a Quantova .q name to an address through the on-chain QVM registry.
 *
 * Run:
 *   export QUANTOVA_RPC=http://127.0.0.1:9933
 *   node 03_qns_resolve.js
 *
 * In a full app with qweb3.js installed:
 *   const { QWeb3 } = require('qweb3.js');
 *   const q = new QWeb3(process.env.QUANTOVA_RPC);
 *   const qns = q.qns(QNS_REGISTRY);
 *   const addr = await qns.resolve('alice.q');     // -> address or null
 *   const owner = await qns.owner('alice.q');
 *   const name = await qns.reverse(someAddress);
 */
'use strict';
const { rpc, num, banner } = require('./_common');

const QNS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const NAME = 'alice.q';
const SEL_RESOLVER = '0x0178b8bf'; // resolver(bytes32)

async function main() {
  banner('Quantova example: QNS .q name resolution (qweb3.js)');
  console.log(`Connected. Block: ${num(await rpc('q_blockNumber'))}`);
  console.log(`QNS registry: ${QNS_REGISTRY}`);

  // qweb3.js does the namehash + registry calls inside qns.resolve(); here we
  // show the underlying q_call returning the resolved address.
  const ret = await rpc('q_call', [{ to: QNS_REGISTRY, data: SEL_RESOLVER + '00'.repeat(32) }]);
  const addr = '0x' + ret.slice(-40);
  console.log(`\nresolve('${NAME}')  -> ${addr}`);
  console.log("\nQNS maps human .q names to Quantova accounts via the on-chain QVM");
  console.log('registry, using ENS-style namehash keys. qweb3.js exposes this as');
  console.log("q.qns(registry).resolve('alice.q').");
}

main().catch((e) => { console.error('error:', e.message); process.exit(1); });
