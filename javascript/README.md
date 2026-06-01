# JavaScript examples (qweb3.js)

Runnable Quantova samples using the official JavaScript client, **qweb3.js**.

## Setup

```bash
npm install                                  # qweb3.js
export QUANTOVA_RPC=http://127.0.0.1:9933     # or https://testnet.quantova.io
```

## Examples

| File | Scenario |
|---|---|
| [01_transfer.js](01_transfer.js) | Native TQTOV transfer (connect, balance, fee, PQ-sign, broadcast) |
| [02_contract_call.js](02_contract_call.js) | QRC20 read + write on the QVM (Solidity ABI, keccak-256 selectors) |
| [03_qns_resolve.js](03_qns_resolve.js) | Resolve a `.q` name via the on-chain QNS registry |
| [04_governance_vote.js](04_governance_vote.js) | Post-quantum conviction vote on a referendum |

```bash
node 01_transfer.js
node 02_contract_call.js
node 03_qns_resolve.js
node 04_governance_vote.js
```

## Note on dependencies

Each file's header comment shows the idiomatic **qweb3.js** API for that scenario
(`new QWeb3(url)`, `q.contract(abi, addr).call(...)`, `q.qns(reg).resolve(...)`,
`wallet.create('dilithium')`). The runnable body uses a small raw JSON-RPC helper
(`_common.js`) so the examples work without installing the native `@quantova` WASM
packages. With `qweb3.js` installed, swap the helper calls for the facade shown in
the comments — the endpoints and flow are identical.

keccak-256 selectors (e.g. `transfer(address,uint256)` -> `0xa9059cbb`) are shown as
constants in the contract example; `qweb3.js` computes them via
`AbiCodec.functionSelector(...)`.
