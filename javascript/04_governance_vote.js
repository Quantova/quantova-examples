#!/usr/bin/env node
/**
 * Example 4 — Governance vote (qweb3.js)
 *
 * Cast a post-quantum-signed vote on a Quantova governance referendum. Voting
 * power = QTOV * conviction multiplier (1.0x liquid up to 2.5x for a 24-month
 * lock). Every vote is a post-quantum-signed extrinsic.
 *
 * Run:
 *   export QUANTOVA_RPC=http://127.0.0.1:9933
 *   node 04_governance_vote.js
 *
 * In a full app with qweb3.js installed you build the conviction-voting `vote`
 * call, sign it with the wallet (post-quantum), and submit it.
 */
'use strict';
const { rpc, num, toPlanck, banner } = require('./_common');

const REFERENDUM_INDEX = 7;
const VOTE_AYE = true;
const VOTE_QTOV = 1000;
const LOCK = 'locked2x';
const MULT = { none: 1.0, locked1x: 1.0, locked2x: 2.0, locked3x: 3.0, locked4x: 4.0, locked5x: 5.0, locked6x: 6.0 };

async function main() {
  banner('Quantova example: governance vote (qweb3.js)');
  console.log(`Connected. Block: ${num(await rpc('q_blockNumber'))}`);

  const mult = MULT[LOCK];
  const power = VOTE_QTOV * mult;
  console.log(`\nReferendum #${REFERENDUM_INDEX}`);
  console.log(`Vote: ${VOTE_AYE ? 'AYE' : 'NAY'}  with ${VOTE_QTOV} QTOV @ ${LOCK} (${mult}x)`);
  console.log(`Effective voting power: ${power.toLocaleString()} votes`);

  const call = `ConvictionVoting.vote(poll_index=${REFERENDUM_INDEX},vote={aye:${VOTE_AYE},balance:${toPlanck(VOTE_QTOV)},conviction:${LOCK}})`;
  console.log(`\ncall: ${call}`);
  console.log('In qweb3.js the wallet post-quantum-signs this call, then submits it.');

  const raw = '0x' + Buffer.from(call).toString('hex');
  const txHash = await rpc('q_sendRawTransaction', [raw]);
  console.log(`Vote submitted! tx hash: ${txHash}`);
  const rcpt = await rpc('q_getTransactionReceipt', [txHash]);
  console.log(`Included in block: ${num(rcpt.blockNumber)}   status: ${rcpt.status}`);
  console.log('\nThe vote is recorded by pallet-conviction-voting on the Referenda poll.');
}

main().catch((e) => { console.error('error:', e.message); process.exit(1); });
