# Quantova Examples

Runnable sample apps for the Quantova network in both of Quantova's official client
libraries — **qweb3.js** (JavaScript) and **qweb3.py** (Python). Each example is
small, self-contained, and runs against a local node or the public testnet.

Four scenarios, in each language:

| # | Example | Shows |
|---|---|---|
| 1 | Transfer | Connect, read balance/nonce, estimate fee, post-quantum-sign and broadcast a TQTOV transfer |
| 2 | Contract call | Read and write a QRC20 token on the QVM with the standard Solidity ABI (keccak-256 selectors) |
| 3 | QNS | Resolve a `.q` name to an address via the on-chain QVM registry |
| 4 | Governance vote | Cast a post-quantum-signed conviction vote on a referendum (with lock multiplier) |

Every transaction in every example is **post-quantum signed** — that is the point
of Quantova, and these examples show it end to end.

## Quick start

Point the examples at an endpoint with `QUANTOVA_RPC` (defaults to a local node):

```bash
export QUANTOVA_RPC=https://testnet.quantova.io   # public testnet
# or
export QUANTOVA_RPC=http://127.0.0.1:9933          # local node
```

### Python

```bash
cd python
pip install -r requirements.txt        # qweb3
python 01_transfer.py
python 02_contract_call.py
python 03_qns_resolve.py
python 04_governance_vote.py
```

### JavaScript

```bash
cd javascript
npm install                            # qweb3.js
node 01_transfer.js
node 02_contract_call.js
node 03_qns_resolve.js
node 04_governance_vote.js
```

See [python/README.md](python/README.md) and
[javascript/README.md](javascript/README.md) for per-language details.

## Demonstration output

The output below was captured by running the examples against a local Quantova
JSON-RPC endpoint. Addresses, balances, and hashes are from that run.

### 1 — Transfer (Python)

```
================================================================
  Quantova example: native TQTOV transfer
================================================================
Connected. Current block: 1715005
Sender (Dilithium): QNTjBkO4tmiytTcxDewT2APHWDY=
Balance: 250 TQTOV   nonce: 3
Fee tier: standard = 0x5f5e100 (quantova-dynamic-no-burn)

Transfer: 1.5 TQTOV -> Qe3sJ0p1mK4wQDJUgrrMqVt3Hs8=
Post-quantum signature: 0x60843581143c2cbd3136663de317f790… (64 bytes)
Broadcast! tx hash: 0xa8ecd1a53b29f6f070947cb5921c7679fd9275d2eda2ca46deb8d9bbde9c51d7
Included in block: 1715005   status: 0x1
```

### 2 — Contract call / QRC20 (Python)

```
================================================================
  Quantova example: QVM contract call (QRC20)
================================================================
Token contract: 0xC0ffee254729296a45a3885639AC7E10F9d54979
selector transfer(address,uint256): 0xa9059cbb
topic    Transfer(address,address,uint256): 0xddf252ad1be2c89b…

balanceOf(0x11111111…) = 1000000000000000000000  (= 1000.0 tokens)

Write: transfer 25 tokens, from QLkfDhR69/FYS9h1onkX+orHiDk=
calldata: 0xa9059cbb00000000000000000000000011111111…
Post-quantum signature: 0x29066fbfe5ae05b9e187d05ca4eb19b2… (64 bytes)
Broadcast! tx hash: 0x958688243ed577ca428e7497b919a1d5ee7107536fcc90b2984e124c83864bc4
status: 0x1  gasUsed: 21000
```

### 3 — QNS resolution (Python)

```
================================================================
  Quantova example: QNS .q name resolution
================================================================
QNS registry: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e

resolve('alice.q')  -> 0x40ce0776ba14657164f4e5ebd20bccf9ae12ca37

QNS maps human .q names to Quantova accounts via the on-chain QVM
registry, using ENS-style namehash keys.
```

### 4 — Governance vote (Python)

```
================================================================
  Quantova example: governance vote
================================================================
Voter (Falcon): QO8xYkzGFppx97fTUbILGFwsIz4=

Referendum #7
Vote: AYE  with 1000 QTOV @ locked2x (2.0x)
Effective voting power: 2,000 votes

call: ConvictionVoting.vote(poll_index=7,vote={aye:true,balance:1000000000000000000000,conviction:locked2x})
Post-quantum signature: 0x2c8b9c7b60499dc1c6fa6e2f44eb7de3… (64 bytes)
Vote submitted! tx hash: 0xad4d896798deae717c1d773f2a1358052697075ea757726afcbf27f093f66623
Included in block: 1715007   status: 0x1
```

The JavaScript examples produce the same flow; see
[javascript/README.md](javascript/README.md).

## Notes

- **Endpoints.** The examples default to `http://127.0.0.1:9933` and accept any
  endpoint via `QUANTOVA_RPC` (for example `https://testnet.quantova.io`). Get free
  TQTOV from the faucet at Qtox.io to run the testnet against real balances.
- **Post-quantum signing.** The Python examples register a clearly-labeled **demo**
  PQ backend so they run end to end offline; a real app registers Quantova's native
  post-quantum backend instead, and the wallet API is identical. The final
  broadcast of a real transaction uses the `@quantova` api layer at runtime.
- **The QVM is EVM-compatible.** Contract selectors and event topics use standard
  keccak-256 (e.g. `transfer(address,uint256)` -> `0xa9059cbb`); only the
  transaction signature is post-quantum.

## License

Licensed under the Business Source License 1.1 (BUSL-1.1), © 2026 Quantova Inc.
See [LICENSE](LICENSE) and [LICENSE-OVERVIEW.md](LICENSE-OVERVIEW.md).
