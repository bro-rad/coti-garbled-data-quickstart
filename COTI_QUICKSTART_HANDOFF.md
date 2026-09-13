# COTI Quickstart Integration Handoff

## Source wallet state

This note mirrors the current state of the sibling Punk Wallet repository at `/Users/tekh/rn/punk-wallet`.

- Wallet repository branch: `punk-wallet`
- Quickstart repository: `coti-garbled-data-quickstart`
- The wallet and quickstart are separate repositories.
- The wallet COTI snapshot is committed locally as `0bf8994` (`Add COTI private wallet integration and skills`). It has not been pushed.
- The current Punk Wallet branch is `punk-wallet`; WalletConnect COTI bridge edits are currently uncommitted in `packages/react-app/src/App.jsx` and `packages/react-app/src/components/WalletConnectTransactionPopUp.jsx`.
- This quickstart checkout has this handoff file as an untracked local file. Keep it while starting a new chat.

## Start here

This is a two-application runtime setup. The repositories stay separate; do not merge the wallet implementation into the quickstart just to run them together.

Terminal 1, COTI quickstart on port `3000`:

```bash
cd /Users/tekh/rn/coti-garbled-data-quickstart
yarn start
```

Terminal 2, Punk Wallet on port `3001`:

```bash
cd /Users/tekh/rn/punk-wallet
PORT=3001 yarn start
```

Open the quickstart at `http://localhost:3000` and the wallet at `http://localhost:3001`.

The wallet already supports WalletConnect v2 sessions and the `/wc?uri=...` deep-link route. Use the quickstart's existing WalletConnect connect link or URI, and open/pair it with the Punk Wallet. Do not add a new connector or assume both apps run on the same port.

## What is implemented in the wallet repository

The Punk Wallet React app contains a direct COTI Ethers private-session flow:

- COTI Mainnet and Testnet chain support.
- Punk Wallet key / signer binding to the connected account.
- First-time AccountOnboard onboarding through the COTI AccountOnboard contract.
- Encrypted browser recovery backup using AES-GCM and a signature-derived key.
- Recovery-state classification for missing, valid, stale, and corrupt backups.
- Lock and unlock lifecycle handling with in-memory COTI signer cleanup.
- Timeout and busy-state guards for onboarding, recovery, status, encryption, decryption, and AES rotation actions.
- Native COTI balance and onboarding status display.
- COTI token balance components and private-operation UI in the React app.
- WalletConnect private RPC methods: `coti_getStatus`, `coti_unlock`, `coti_lock`, `coti_encryptValue`, `coti_decryptValue`, and `coti_rotateAes`.
- WalletConnect COTI requests now route through the existing wallet-owned session and require the existing request approval modal. The dApp receives encrypted values or decrypted results, never AES material.

Relevant wallet files:

- `packages/react-app/src/helpers/CotiPrivateSession.js`
- `packages/react-app/src/hooks/useCotiPrivateSession.js`
- `packages/react-app/src/components/CotiSection.jsx`
- `packages/react-app/src/components/CotiTokenBalances.jsx`
- `packages/react-app/src/helpers/CotiPrivateSession.test.js`
- `packages/hardhat/scripts/onboardCotiWallet.js`
- `packages/hardhat/scripts/estimateCotiOnboarding.js`

## Current behavior

The onboarding flow is the first operation for a fresh funded wallet. After successful onboarding, the browser stores encrypted recovery state. A later unlock can restore that state and recover the AES material.

The `Recover / Rotate AES` action calls COTI Ethers `generateOrRecoverAes` and now displays an explicit success message after the promise resolves. Recovery does not create a new transaction or block: COTI derives the AES key locally from the original `AccountOnboarded` transaction. The status panel displays that confirmed onboarding block as the AES recovery source block.

The stale-state fixes are intended to ensure that:

- status information from a previous account or session is cleared after rebinding and locking;
- a fresh wallet is allowed to complete onboarding before recovery-only messaging appears;
- timed-out status/recovery actions stop spinning and reset the session;
- lock/unlock does not reuse stale in-memory signer or recovery state.

The dApp-facing request shapes are:

```json
{"account":"0x...","chainId":7082400,"value":"1","contract":"0x...","selector":"0x..."}
```

`coti_encryptValue` uses `value`, `contract`, and `selector`; `coti_decryptValue` uses `value`. Status, unlock, lock, and AES rotation use the account and chain binding maintained by the wallet session.

## Focused validation completed

The focused helper regression suite has passed in the wallet repository:

```bash
yarn react-app:test --watchAll=false --runInBand packages/react-app/src/helpers/CotiPrivateSession.test.js
```

The React build also passed earlier in the debugging sequence. A full browser smoke test of fresh-wallet onboarding followed by lock, recovery, and private encrypt/decrypt remains the next validation step.

The quickstart COTI profile compile passes. Its counter exercise script supports both `--increment <amount>` and `--decrement <amount>` and passes focused ESLint. The package-wide Hardhat typecheck still has three unrelated Rocketh `capturedTransactions` type errors. Punk Wallet's focused COTI helper suite passes; its React build passes with `yarn build`.

## Port allocation

The wallet app uses Create React App and defaults to port `3000`. Run it on port `3001` so it can coexist with the COTI quickstart:

```bash
cd /Users/tekh/rn/punk-wallet
PORT=3001 yarn start
```

The quickstart is a Next.js app and its normal `yarn start` command uses port `3000`. The two apps must not both use `3000`.

## Integration order

1. Keep the wallet running from `/Users/tekh/rn/punk-wallet` on `3001`.
2. Run this quickstart on `3000`.
3. Connect the quickstart through its existing WalletConnect link/URI to the wallet.
4. Select COTI Testnet in the wallet and use a newly funded test account.
5. Run the fresh-wallet flow: connect, fund the wallet, onboard, lock, unlock/recover, rotate AES, and perform one private encrypt/decrypt operation in the quickstart.
6. Unlock or onboard Punk Wallet, then let the quickstart call `coti_encryptValue` for `add` or `subtract` and `coti_decryptValue` for `sum()`.
7. Use the original wallet repository when changing wallet behavior; keep quickstart contract/frontend changes limited to the quickstart app.

## Safe handling

- Do not put private keys, AES keys, RSA keys, or recovery plaintext into logs, status text, screenshots, or commits.
- Verify the active chain before onboarding or recovery.
- Keep the encrypted recovery backup account- and chain-scoped.
- Treat a successful onboarding transaction and a usable browser recovery backup as separate conditions.
- Do not blindly copy the wallet's package lockfile or build configuration into the quickstart; reconcile dependencies and scripts first.
