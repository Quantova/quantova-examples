#!/usr/bin/env python3
"""Example 4 — Governance vote (qweb3.py)

Cast a post-quantum-signed vote on a Quantova governance referendum. Shows reading
the current referendum, building a conviction vote (aye + lock multiplier), and
post-quantum-signing it before submission.

Governance background: votes are weighted by QTOV, with a lock-duration multiplier
(1.0x liquid, up to 2.5x for a 24-month lock). Every vote is a post-quantum-signed
extrinsic. See the quantova-governance repo for the full model.

Run:
    export QUANTOVA_RPC=http://127.0.0.1:9933
    python 04_governance_vote.py
"""

from _common import banner, connect, num, to_planck

REFERENDUM_INDEX = 7
VOTE_AYE = True
VOTE_QTOV = 1000          # QTOV committed to the vote
LOCK = "locked2x"         # conviction: none/locked1x/locked2x/locked3x/locked4x/locked5x/locked6x
LOCK_MULTIPLIERS = {"none": 1.0, "locked1x": 1.0, "locked2x": 2.0, "locked3x": 3.0,
                    "locked4x": 4.0, "locked5x": 5.0, "locked6x": 6.0}


def main():
    banner("Quantova example: governance vote")
    from _common import use_demo_backend
    use_demo_backend()
    q = connect()
    print(f"Connected. Block: {num(q.rpc.block_number())}")

    voter = q.wallet.create("falcon")
    print(f"Voter (Falcon): {voter.address}")

    # voting power = QTOV * conviction multiplier
    mult = LOCK_MULTIPLIERS[LOCK]
    power = VOTE_QTOV * mult
    print(f"\nReferendum #{REFERENDUM_INDEX}")
    print(f"Vote: {'AYE' if VOTE_AYE else 'NAY'}  with {VOTE_QTOV} QTOV @ {LOCK} ({mult}x)")
    print(f"Effective voting power: {power:,.0f} votes")

    # build the conviction-voting vote call payload (pallet_conviction_voting::vote)
    vote_payload = (
        f"ConvictionVoting.vote(poll_index={REFERENDUM_INDEX},"
        f"vote={{aye:{str(VOTE_AYE).lower()},"
        f"balance:{to_planck(VOTE_QTOV)},conviction:{LOCK}}})"
    )
    print(f"\ncall: {vote_payload}")

    # post-quantum-sign the vote
    sig = voter.address and q.wallet.sign_transaction(vote_payload, voter.address)
    print(f"Post-quantum signature: {sig[:34]}… ({len(sig)//2 - 1} bytes)")

    try:
        tx_hash = q.rpc.call("q_sendRawTransaction", [sig])
        print(f"Vote submitted! tx hash: {tx_hash}")
        rcpt = q.rpc.get_transaction_receipt(tx_hash)
        print(f"Included in block: {num(rcpt['blockNumber'])}   status: {rcpt['status']}")
    except Exception as e:
        print(f"(submission step: {e})")

    print("\nThe vote is recorded by pallet-conviction-voting on the Referenda poll,")
    print("and the locked QTOV stays locked for the chosen conviction period.")


if __name__ == "__main__":
    main()
