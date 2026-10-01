# COTI Quickstart Integration Handoff

## Source wallet state

This note mirrors the current state of the sibling Punk Wallet repository. The wallet and quickstart remain separate repositories.

- Wallet repository branch: `punk-wallet`
- Quickstart repository: `coti-garbled-data-quickstart`
- WalletConnect COTI bridge edits are currently in the wallet repository.

## Start here

Run the two applications from their respective cloned repositories. Keep the quickstart on port `3000` and the wallet on port `3001` so they can run together:

```bash
# Quickstart repository
yarn start

# Wallet repository, from a second terminal
PORT=3001 yarn start
```

Open the quickstart at `http://localhost:3000` and the wallet at `http://localhost:3001`. Use the quickstart's existing WalletConnect connect link or URI to pair it with Punk Wallet.

## Wallet integration

Punk Wallet owns COTI onboarding, AES recovery, lock/unlock, rotation, encryption, and decryption. The quickstart may call `coti_getStatus`, `coti_unlock`, `coti_lock`, `coti_encryptValue`, `coti_decryptValue`, and `coti_rotateAes`, but it must never receive or persist plaintext AES material.

The dApp-facing request shapes are:

```json
{"account":"0x...","chainId":7082400,"value":"1","contract":"0x...","selector":"0x..."}
```

## Current behavior

The onboarding flow is the first operation for a fresh funded wallet. After successful onboarding, the browser stores encrypted recovery state. A later unlock can restore that state and recover the AES material.

The `Recover / Rotate AES` action calls COTI Ethers `generateOrRecoverAes` and displays an explicit success message after the promise resolves. Recovery does not create a new transaction or block: COTI derives the AES key from the original `AccountOnboarded` transaction.

The dApp must clear status information from a previous account or session after rebinding and locking. A fresh wallet must be allowed to complete onboarding before recovery-only messaging appears, and timed-out status or recovery actions must stop spinning and reset the session.

## Focused validation

The focused wallet helper regression suite and React build pass. The quickstart COTI profile compile passes, and its counter exercise supports both `--increment <amount>` and `--decrement <amount>`.

## Port allocation

The wallet app defaults to port `3000`; use port `3001` when running both applications. The quickstart uses port `3000` by default. The two applications must not share a port.

## Integration order

1. Run Punk Wallet on port `3001`.
2. Run this quickstart on port `3000`.
3. Connect the quickstart through its existing WalletConnect link or URI.
4. Select COTI Testnet and use a newly funded test account.
5. Onboard or unlock the wallet, then perform one private encrypt/decrypt operation in the quickstart.
6. Keep wallet behavior changes in the wallet repository and quickstart contract/frontend changes in the quickstart repository.

## Safe handling

- Do not put private keys, AES keys, RSA keys, or recovery plaintext into logs, status text, screenshots, or commits.
- Verify the active chain before onboarding or recovery.
- Keep the encrypted recovery backup account- and chain-scoped.