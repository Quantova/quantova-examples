# Python examples (qweb3.py)

Runnable Quantova samples using the official Python client, **qweb3.py**.

## Setup

```bash
pip install -r requirements.txt        # qweb3
export QUANTOVA_RPC=http://127.0.0.1:9933   # or https://testnet.quantova.io
```

## Examples

| File | Scenario |
|---|---|
| [01_transfer.py](01_transfer.py) | Native TQTOV transfer (connect, balance, fee, PQ-sign, broadcast) |
| [02_contract_call.py](02_contract_call.py) | QRC20 read + write on the QVM (Solidity ABI, keccak-256 selectors) |
| [03_qns_resolve.py](03_qns_resolve.py) | Resolve a `.q` name via the on-chain QNS registry |
| [04_governance_vote.py](04_governance_vote.py) | Post-quantum conviction vote on a referendum |

```bash
python 01_transfer.py
python 02_contract_call.py
python 03_qns_resolve.py
python 04_governance_vote.py
```

## How signing works in these examples

`_common.py` provides `use_demo_backend()`, which registers a **demonstration**
post-quantum backend so the examples sign and run end to end with no native
dependencies. It is deterministic and well-formed but **not** cryptographically
secure — never use it with real value.

In a production app you instead register Quantova's native post-quantum backend
(the `@quantova` WASM modules). The wallet API (`wallet.create('dilithium')`,
`wallet.sign_transaction(...)`) is identical, so the example code does not change.
