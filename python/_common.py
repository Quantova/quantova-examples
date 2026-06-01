"""Shared configuration and helpers for the Quantova Python examples.

Each example imports `connect()` to get a configured QWeb3 client and small
formatting helpers. Point QUANTOVA_RPC at any endpoint:

    export QUANTOVA_RPC=https://testnet.quantova.io   # public testnet
    export QUANTOVA_RPC=http://127.0.0.1:9933          # local node (default)
"""

import os

from qweb3 import QWeb3

DECIMALS = 18
PLANCK = 10 ** DECIMALS

# Default to a local node; override with QUANTOVA_RPC.
RPC_URL = os.environ.get("QUANTOVA_RPC", "http://127.0.0.1:9933")


def use_demo_backend():
    """Register a DEMO post-quantum crypto backend so the signing examples run
    end-to-end offline.

    This is for demonstration only. In a real app you register Quantova's native
    post-quantum backend (the @quantova WASM modules) instead — the wallet API is
    identical, so the example code does not change. The demo backend produces
    deterministic, well-formed signatures but is NOT cryptographically secure and
    must never be used with real value.
    """
    import hashlib

    from qweb3 import crypto_backend

    class _DemoBackend:
        def __getattr__(self, name):
            for scheme in ("falcon", "dilithium", "sphincsp"):
                if name == f"{scheme}_pair_from_seed":
                    def _pair(seed, s=scheme):
                        # Mimic Quantova's account-id shape: 20-byte H160 whose
                        # leading byte is 0x40 (the "Q" marker), so the derived
                        # address begins with Q. (Demo derivation only.)
                        digest = bytearray(hashlib.sha3_256(s.encode() + bytes(seed)).digest())
                        digest[0] = 0x40
                        return {"public_key": bytes(digest)}
                    return _pair
                if name == f"{scheme}_sign":
                    return lambda seed, pk, msg, s=scheme: hashlib.sha3_512(
                        s.encode() + bytes(seed) + bytes(msg)
                    ).digest()
                if name == f"{scheme}_verify":
                    return lambda pk, msg, sig: len(sig) == 64
            raise AttributeError(name)

    crypto_backend.set_backend(_DemoBackend())
    return True


def connect():
    """Return a QWeb3 client pointed at RPC_URL."""
    return QWeb3(RPC_URL)


def to_qtov(planck_value):
    """Format an integer planck value as a human TQTOV/QTOV string."""
    if isinstance(planck_value, str):
        planck_value = int(planck_value, 16) if planck_value.startswith("0x") else int(planck_value)
    whole = planck_value / PLANCK
    return f"{whole:,.6f}".rstrip("0").rstrip(".")


def to_planck(qtov_value):
    """Convert a QTOV amount (int/float/str) to integer planck."""
    return int(round(float(qtov_value) * PLANCK))


def num(hex_or_int):
    """Coerce a hex string or int to int."""
    if isinstance(hex_or_int, str):
        return int(hex_or_int, 16) if hex_or_int.startswith("0x") else int(hex_or_int)
    return int(hex_or_int)


def banner(title):
    line = "=" * 64
    print(line)
    print(f"  {title}")
    print(line)
