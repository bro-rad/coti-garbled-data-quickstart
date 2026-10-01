# COTI Quickstart Integration Handoff

## Source wallet state

This note mirrors the COTI wallet implementation in the sibling `punk-wallet` repository (`../punk-wallet`). The wallet and quickstart are separate repositories.

- Wallet repository branch: `punk-wallet`
- Quickstart repository: `coti-garbled-data-quickstart`
- The wallet COTI snapshot is committed as `0bf8994` (`Add COTI private wallet integration and skills`).
- The WalletConnect COTI bridge is implemented in the wallet repository.

## Start here

This is a two-application runtime setup. Keep the repositories separate; do not merge the wallet implementation into the quickstart just to run them together. The commands below assume the repositories are cloned as sibling directories. If they are elsewhere, run each command from its repository root.

Terminal 1, COTI quickstart on port `3000`:

```bash
yarn start
```

Terminal 2, Punk Wallet on port `3001`:

```bash
# macOS, Linux, Git Bash
cd ../punk-wallet
PORT=3001 yarn start
```

```powershell
# PowerShell
Set-Location ..\punk-wallet
$env:PORT = "3001"
yarn start
```

```cmd
:: Windows Command Prompt
cd ..\punk-wallet
set "PORT=3001" && yarn start
```

Open the quickstart at `http://localhost:3000` and the wallet at `http://localhost:3001`.

The wallet supports WalletConnect v2 sessions and the `/wc?uri=...` deep-link route. Use the quickstart's existing WalletConnect connect link or URI and pair it with Punk Wallet. Do not add a new connector or assume both apps run on the same port.

## What is implemented in the wallet repository

The Punk Wallet React app contains a direct COTI Ethers private-session flow:

- COTI Mainnet and Testnet chain support.
- Punk Wallet key and signer binding to the connected account.
- First-time AccountOnboard onboarding through the COTI AccountOnboard contract.
- Encrypted browser recovery backup using AES-GCM and a signature-derived key.
- Recovery-state classification for missing, valid, stale, and corrupt backups.
- Lock and unlock lifecycle handling with in-memory COTI signer cleanup.
- Timeout and busy-state guards for onboarding, recovery, status, encryption, decryption, and AES rotation actions.
- Native COTI balance and onboarding status display.
- COTI token balance components and private-operation UI in the React app.
- WalletConnect private RPC methods: `coti_getStatus`, `coti_unlock`, `coti_lock`, `coti_encryptValue`, `coti_decryptValue`, and `coti_rotateAes`.
- WalletConnect COTI requests route through the wallet-owned session and require request approval. The dApp receives encrypted values or decrypted results, never AES material.

Relevant wallet files, relative to the wallet repository root:

- `packages/react-app/src/helpers/CotiPrivateSession.js`
- `packages/react-app/src/hooks/useCotiPrivateSession.js`
- `packages/react-app/src/components/CotiSection.jsx`
- `packages/react-app/src/components/CotiTokenBalances.jsx`
- `packages/react-app/src/helpers/CotiPrivateSession.test.js`
- `packages/hardhat/scripts/onboardCotiWallet.js`
- `packages/hardhat/scripts/estimateCotiOnboarding.js`

## Current behavior

Onboarding is the first operation for a fresh funded wallet. After successful onboarding, the browser stores encrypted recovery state. A later unlock can restore that state and recover the AES material.

The `Recover / Rotate AES` action calls COTI Ethers `generateOrRecoverAes` and displays an explicit success message after the promise resolves. Recovery does not create a new transaction or block: COTI derives the AES key from the original `AccountOnboarded` transaction. The status panel displays that confirmed onboarding block as the AES recovery source block.

The stale-state fixes are intended to ensure that:

- Status information from a previous account or session is cleared after rebinding and locking.
- A fresh wallet can complete onboarding before recovery-only messaging appears.
- Timed-out status and recovery actions stop spinning and reset the session.
- Lock and unlock do not reuse stale in-memory signer or recovery state.

The quickstart can call the wallet's private RPC methods, but must never receive or persist plaintext AES material. Private values remain visible only while the wallet session is unlocked. Sender address, target contract, method selector, transaction existence, timing, gas payer, and general RPC interaction metadata remain observable.

The dApp-facing request shapes are:

```json
{"account":"0x...","chainId":7082400,"value":"1","contract":"0x...","selector":"0x..."}
```

`coti_encryptValue` uses `value`, `contract`, and `selector`; `coti_decryptValue` uses `value`. Status, unlock, lock, and AES rotation use the account and chain binding maintained by the wallet session.

## Focused validation completed

The focused wallet helper regression suite has passed:

```bash
yarn react-app:test --watchAll=false --runInBand packages/react-app/src/helpers/CotiPrivateSession.test.js
```

The React build also passed earlier. A full browser smoke test of fresh-wallet onboarding followed by lock, recovery, and private encrypt/decrypt remains the next validation step.

The quickstart COTI profile compile passes. Its counter exercise supports both `--increment <amount>` and `--decrement <amount>` and passes focused ESLint. At the time this handoff was written, the package-wide Hardhat typecheck had three unrelated Rocketh `capturedTransactions` type errors. Punk Wallet's focused COTI helper suite and React build pass.

## Port allocation

The wallet app uses Create React App and defaults to port `3000`. Run it on port `3001` to coexist with the quickstart, as shown above. The quickstart is a Next.js app and its normal `yarn start` command uses port `3000`. The two apps must not both use `3000`.

## Integration order

1. Keep Punk Wallet running from the sibling `../punk-wallet` checkout on port `3001`.
2. Run this quickstart from its repository root on port `3000`.
3. Connect the quickstart through its existing WalletConnect link or URI to the wallet.
4. Select COTI Testnet in the wallet and use a newly funded test account.
5. Run the fresh-wallet flow: connect, fund the wallet, onboard, lock, unlock/recover, rotate AES, and perform one private encrypt/decrypt operation in the quickstart.
6. Unlock or onboard Punk Wallet, then let the quickstart call `coti_encryptValue` for `add` or `subtract` and `coti_decryptValue` for `sum()`.
7. Use the wallet repository when changing wallet behavior; keep quickstart contract and frontend changes limited to this repository.

## Safe handling

- Do not put private keys, AES keys, RSA keys, or recovery plaintext into logs, status text, screenshots, or commits.
- Verify the active chain before onboarding or recovery.
- Keep the encrypted recovery backup account- and chain-scoped.
- Treat a successful onboarding transaction and a usable browser recovery backup as separate conditions.
- Do not blindly copy the wallet's package lockfile or build configuration into the quickstart; reconcile dependencies and scripts first.