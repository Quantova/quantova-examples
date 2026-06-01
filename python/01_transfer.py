#!/usr/bin/env python3
"""Example 1 — Native transfer (qweb3.py)

Send TQTOV from one Quantova account to another. Shows: connecting, reading a
balance, estimating the fee, deriving a post-quantum account, and
post-quantum-signing the transfer payload before broadcast.

Run:
    export QUANTOVA_RPC=http://127.0.0.1:9933   # or https://testnet.quantova.io
    python 01_transfer.py

This example registers a DEMO post-quantum backend so it runs end-to-end offline.
In a real app you register Quantova's native PQ backend instead; the wallet API is
identical. The final broadcast uses the @quantova api layer at runtime.
"""

from _common import banner, connect, num, to_planck, to_qtov, use_demo_backend

RECIPIENT = "Qe3sJ0p1mK4wQDJUgrrMqVt3Hs8="  # example Q-address (replace with a real one)
AMOUNT_QTOV = 1.5


def main():
    banner("Quantova example: native TQTOV transfer")
    use_demo_backend()  # demo only — real apps register the @quantova PQ backend
    q = connect()

    block = num(q.rpc.block_number())
    print(f"Connected. Current block: {block}")

    # --- derive a post-quantum sender account ---
    sender = q.wallet.create("dilithium")
    print(f"Sender (Dilithium): {sender.address}")

    bal = num(q.rpc.get_balance(sender.address))
    nonce = num(q.rpc.get_transaction_count(sender.address))
    print(f"Balance: {to_qtov(bal)} TQTOV   nonce: {nonce}")

    # --- estimate fee ---
    try:
        fees = q.fees.estimate()
        print(f"Fee tier: standard = {fees['tiers']['standard']} ({fees.get('model')})")
    except Exception as e:
        print(f"Fee tier: (unavailable: {e})")

    # --- build the transfer payload and post-quantum-sign it ---
    value = to_planck(AMOUNT_QTOV)
    payload = f"transfer:{sender.address}->{RECIPIENT}:{value}:nonce={nonce}"
    signature = q.wallet.sign_transaction(payload, sender.address)
    print(f"\nTransfer: {AMOUNT_QTOV} TQTOV -> {RECIPIENT}")
    print(f"Post-quantum signature: {signature[:34]}… ({len(signature)//2 - 1} bytes)")

    # --- broadcast (needs the @quantova api layer at runtime) ---
    try:
        tx_hash = q.rpc.call("q_sendRawTransaction", [signature])
        print(f"Broadcast! tx hash: {tx_hash}")
        receipt = q.rpc.get_transaction_receipt(tx_hash)
        print(f"Included in block: {num(receipt['blockNumber'])}   status: {receipt['status']}")
    except Exception as e:
        print(f"(broadcast step: {e})")


if __name__ == "__main__":
    main()
