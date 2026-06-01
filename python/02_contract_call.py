#!/usr/bin/env python3
"""Example 2 — QVM contract call (qweb3.py)

Read from and write to a QRC20 token on the Quantova Virtual Machine. Shows the
standard Solidity ABI (keccak-256 selectors), a read via q_call (decoded
automatically), and building + post-quantum-signing a write (transfer).

Run:
    export QUANTOVA_RPC=http://127.0.0.1:9933
    python 02_contract_call.py
"""

from _common import banner, connect, num, use_demo_backend

TOKEN = "0xC0ffee254729296a45a3885639AC7E10F9d54979"  # example QRC20 contract (H160)
HOLDER = "0x1111111111111111111111111111111111111111"

QRC20_ABI = [
    {"type": "function", "name": "name", "stateMutability": "view", "inputs": [], "outputs": [{"type": "string"}]},
    {"type": "function", "name": "balanceOf", "stateMutability": "view",
     "inputs": [{"name": "owner", "type": "address"}], "outputs": [{"type": "uint256"}]},
    {"type": "function", "name": "transfer", "stateMutability": "nonpayable",
     "inputs": [{"name": "to", "type": "address"}, {"name": "value", "type": "uint256"}],
     "outputs": [{"type": "bool"}]},
    {"type": "event", "name": "Transfer", "inputs": [
        {"name": "from", "type": "address", "indexed": True},
        {"name": "to", "type": "address", "indexed": True},
        {"name": "value", "type": "uint256", "indexed": False}]},
]


def main():
    banner("Quantova example: QVM contract call (QRC20)")
    use_demo_backend()
    q = connect()
    print(f"Connected. Block: {num(q.rpc.block_number())}")

    token = q.contract(QRC20_ABI, TOKEN)
    print(f"Token contract: {TOKEN}")

    # --- ABI selectors (standard keccak-256, EVM-compatible) ---
    from qweb3 import abi
    print(f"selector transfer(address,uint256): {abi.function_selector('transfer(address,uint256)')}")
    print(f"topic    Transfer(address,address,uint256): {abi.event_topic('Transfer(address,address,uint256)')[:18]}…")

    # --- read (q_call, decoded automatically) ---
    bal = token.call("balanceOf", [HOLDER])
    print(f"\nbalanceOf({HOLDER[:10]}…) = {bal}  (= {bal / 10**18} tokens)")

    # --- build + post-quantum-sign a write (transfer 25 tokens) ---
    sender = q.wallet.create("falcon")
    calldata = token.encode("transfer", [HOLDER, 25 * 10**18])
    print(f"\nWrite: transfer 25 tokens, from {sender.address}")
    print(f"calldata: {calldata[:42]}…")
    sig = q.wallet.sign_transaction(calldata, sender.address)
    print(f"Post-quantum signature: {sig[:34]}… ({len(sig)//2 - 1} bytes)")

    try:
        tx_hash = q.rpc.call("q_sendRawTransaction", [sig])
        print(f"Broadcast! tx hash: {tx_hash}")
        rcpt = q.rpc.get_transaction_receipt(tx_hash)
        print(f"status: {rcpt['status']}  gasUsed: {num(rcpt['gasUsed'])}")
    except Exception as e:
        print(f"(broadcast step: {e})")


if __name__ == "__main__":
    main()
