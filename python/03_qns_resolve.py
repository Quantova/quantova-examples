#!/usr/bin/env python3
"""Example 3 — QNS .q name resolution (qweb3.py)

Resolve a Quantova .q name to an address through the on-chain QVM registry
contract, look up its owner, and reverse-resolve an address back to a name.

Run:
    export QUANTOVA_RPC=http://127.0.0.1:9933
    python 03_qns_resolve.py
"""

from _common import banner, connect, num

QNS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"  # example QNS registry (H160)
NAME = "alice.q"


def main():
    banner("Quantova example: QNS .q name resolution")
    q = connect()
    print(f"Connected. Block: {num(q.rpc.block_number())}")

    qns = q.qns(QNS_REGISTRY)
    print(f"QNS registry: {QNS_REGISTRY}")

    addr = qns.resolve(NAME)
    print(f"\nresolve('{NAME}')  -> {addr}")

    try:
        owner = qns.owner(NAME)
        print(f"owner('{NAME}')    -> {owner}")
    except Exception as e:
        print(f"owner('{NAME}')    -> (not available: {e})")

    if addr:
        try:
            name = qns.reverse(addr)
            print(f"reverse({addr[:12]}…) -> {name}")
        except Exception as e:
            print(f"reverse(...)       -> (not available: {e})")

    print("\nQNS maps human .q names to Quantova accounts via the on-chain QVM")
    print("registry, using ENS-style namehash keys.")


if __name__ == "__main__":
    main()
