# COTI Garbled Data Quickstart Plan

## Objective

Create a new standalone Scaffold-ETH project at `/Users/tekh/rn/coti-garbled-data-quickstart` using `npx create-eth@latest`. Preserve the untouched generator output as its own baseline commit, then create a local-only `coti-garbled-data-quickstart` branch.

The new project must not depend on `feature/scribecast-coti-hardhat3`, ScribeCast, or the current repository's working tree. It is a concise but complete COTI Testnet example for encrypted inputs, temporary Garbledtext computations, and user-decryptable outputs.

## Scope

The quickstart delivers both:

- A minimal confidential `PrivateCounter` contract and a focused automated/scripted exercise.
- A Scaffold-ETH browser demo for wallet connect, COTI private-state unlock/onboarding, encrypted increment submission, and decrypted total display.

Excluded from the first version:

- ScribeCast.
- Private ERC-20 or NFT features.
- A backend or indexer.
- Custom AES key custody or application-managed secret storage.
- Mainnet deployment, push, or PR creation.

## Repository And Branch Strategy

1. Create the fresh sibling project with `npx create-eth@latest` using the Hardhat flavor.
2. Install its generated dependencies and record the exact generator version and options in the new project's README.
3. Commit the untouched generator output as the reproducible baseline.
4. Create local-only branch `coti-garbled-data-quickstart`.
5. Do not use `feature/scribecast-coti-hardhat3` as a parent or cherry-pick ScribeCast changes.
6. Do not push the new branch.

The original request mentioned cherry-picking EthSkills and COTI material. Because the target is a new generator version, use those commits as source references and recreate the smallest current-version-compatible changes rather than applying historical patches that may conflict:

- `2da2fee425349f0b0e7caaf3f557b92356a99373` from `readme`: EthSkills material.
- `de6bad2b34e6876fa2ea03603a56b78edfd0743f`: COTI integration guidance.
- `fca17b20c6daf77a5ccc436c901d8d5b1ddcd338`: COTI asset-address organization.
- `b958bf291bab9db8590ac58c03d1992758f1094d`: COTI network support reference.

## COTI Testnet Configuration

Configure COTI Testnet consistently in the generated Hardhat and Next.js packages.

| Item | Value |
| --- | --- |
| Chain ID | `7082400` |
| RPC | `https://testnet.coti.io/rpc` |
| WebSocket | `wss://testnet.coti.io/ws` |
| Explorer | `https://testnet.cotiscan.io` |
| Native gas token | `COTI` |
| Native token decimals | `18` |

COTI Mainnet must not be the executable default. It may be documented as an explicitly separate configuration target.

## Private Data Lifecycle

The contract and frontend must follow COTI's documented types and conversions.

1. The browser begins with a clear `uint64` increment only in local UI state.
2. After `usePrivateUnlock().requireUnlock(...)` permits the action, COTI's supported client tooling encrypts the increment as an `itUint64` for the deployed contract address and `add` selector.
3. The contract runs `MpcCore.validateCiphertext` to verify the signed `itUint64` and produce temporary `gtUint64` Garbledtext.
4. The stored network ciphertext is brought on-board as `gtUint64`.
5. `MpcCore` performs the encrypted addition.
6. The result is stored through `MpcCore.offBoardCombined`, creating `utUint64` with a network ciphertext for future computation and a user ciphertext for the caller.
7. `sum()` returns only the caller-decryptable `ctUint64`.
8. The frontend decrypts that output using COTI's plugin/tooling only after successful private-state unlock.

Rules:

- Do not store `gtUint64`; Garbledtext is temporary transaction-only data.
- Do not use public Solidity state variables for secret values.
- Do not log, serialize, persist, or send plaintext AES keys through application code.
- Define and test the encrypted-arithmetic overflow behavior explicitly, preferably with checked MPC arithmetic.

## Contract Work

Add one `PrivateCounter` contract under the generated Hardhat contract directory.

Required behavior:

- Constructor initializes zero through `MpcCore.setPublic64(0)` and `MpcCore.offBoardCombined`.
- `add(itUint64 calldata value)` validates the input and accumulates it with COTI garbled-data functions.
- `sum()` returns the user ciphertext portion only.
- Emit a non-sensitive event after successful increments if the frontend needs a transaction-state signal. It must not disclose the private increment or total.

Expected file:

- `packages/hardhat/contracts/PrivateCounter.sol`

## Tests And Scripted Exercise

Add a narrow confidential-contract test and an explicit COTI Testnet script based on `@coti-io/coti-ethers`.

Tests must cover:

- Correct encrypted zero initialization.
- Valid encrypted input acceptance.
- Computed total decryptable by the submitting user.
- Invalid ciphertext or signature rejection.
- Boundaries and overflow behavior.
- No plaintext secret value in public events or public state.

The Testnet script must:

- Be opt-in and avoid bundled secrets.
- Create or load its signing and AES keys from ignored environment configuration.
- Document the expected first-run funding error and COTI faucet procedure.
- Encrypt, submit, retrieve, and decrypt a counter increment against COTI Testnet.

Expected files:

- `packages/hardhat/test/PrivateCounter.ts`
- `packages/hardhat/scripts/<private-counter-testnet-script>.ts`
- `packages/hardhat/deploy/<private-counter-deployment>.ts`

## Browser Integration

Use the official COTI wallet plugin rather than implementing raw AES-key flows.

Required integration:

- Install and configure `@coti-io/coti-wallet-plugin` and supported COTI client dependencies.
- Call `configureCotiPlugin()` once before any plugin hooks.
- Mount `WagmiRainbowKitProvider` and `PrivacyBridgeProvider` once near the app root.
- Add `NetworkGuard` for unsupported chain handling.
- Use `usePrivateUnlock()` for lock/unlock orchestration.
- Use `usePrivateUnlock().requireUnlock()` before encrypting or decrypting private values.
- Use `usePrivacyBridgeUnlock()` for supported private-value encrypt/decrypt calls.
- Use the plugin-supported encrypted browser-local backup callbacks, without writing raw keys to application state or storage.

The page needs the following user states:

- Wallet disconnected.
- Unsupported network with an actionable COTI Testnet switch path.
- Private state locked.
- Private onboarding/unlock pending.
- Encrypted transaction pending and confirmed.
- RPC, user-rejection, and transaction errors.
- A decrypted total that is visible only after unlock.

The page must not present ciphertext as the user's counter value.

Expected files:

- `packages/nextjs/scaffold.config.ts`
- `packages/nextjs/app/layout.tsx` or generated provider module
- `packages/nextjs/app/page.tsx`
- Generated deployment ABI/config in `packages/nextjs/contracts/deployedContracts.ts`; do not manually author this output.

## Documentation

The standalone README must include:

- Exact generator command/version and selection choices.
- Project install, compile, test, deploy, and frontend commands.
- COTI Testnet chain configuration.
- Funded-wallet and faucet requirements.
- Wallet plugin, Snap, onboarding, and encrypted-backup expectations.
- Instructions for running the Testnet exercise.
- A testnet-only warning.
- Clear privacy boundaries: gcEVM encrypts values, but sender address, target contract, selector, transaction existence, timing, gas payer, and general interaction metadata remain observable.
- Direct script/API escape route, so the UI is not the only way to exercise the contract.

## Validation

1. Run the generated project's initial install, lint, contract compile, and Next.js build before making COTI changes.
2. Compile using the COTI-compatible profile and run the narrow `PrivateCounter` tests.
3. Confirm the generated ABI encodes `itUint64`, `utUint64`, and `ctUint64` as required by COTI.
4. Fund the generated deployer from the official COTI Testnet faucet and run the Testnet encrypt-submit-decrypt exercise.
5. Build and lint the frontend, then complete the browser flow using a COTI Testnet wallet.
6. Inspect browser storage and logs to confirm plaintext AES keys are absent.
7. Confirm locked and unsupported-network states block private operations.
8. Confirm the local branch history descends from the new generator baseline and has no ScribeCast commit as an ancestor.
9. Confirm the feature branch has no configured or pushed upstream.

## CROPS Record

### Chosen Default

A permissionless COTI Testnet counter with local, wallet/plugin-managed encryption and a fully reproducible standalone repository. The tutorial demonstrates private values without custody, a backend, an indexer, or protocol-specific business logic.

### Censorship Resistance

- Risk: Testnet RPC/network services, wallet extension/Snap, and the primary frontend can disrupt access.
- Mitigation: Publish source, ABI, deployment code, and the direct `@coti-io/coti-ethers` script. Document RPC configuration and an alternate-client path.
- User escape: Run the script or a forked client against the deployed contract.

### Open And Free

- Risk: A generator-only walkthrough or opaque SDK versioning can be difficult to reproduce.
- Mitigation: Commit source, lockfiles, documented generator options, explicit COTI dependency versions, ABI, deployment procedure, and setup notes under a permissive project license.
- User escape: Fork, rebuild, self-host, or use an independent contract client.

### Privacy

- Risk: Values can be confidential while wallet address, transaction timing, gas spending, contract interaction, and RPC metadata remain visible.
- Mitigation: Do not use analytics, key/value logging, or app-owned plaintext AES storage. Use COTI's provider-managed unlock and encrypted backup flow. Document the metadata boundary precisely.
- User escape: Use a separate wallet/RPC or self-hosted client. Users who require metadata privacy need a different protocol design.

### Security

- Risk: A compromised wallet/browser or incorrect handling of AES backups can expose access to private values. `isUnlocked` alone does not prove a usable key exists.
- Mitigation: Let the plugin own onboarding and unlock. Guard private calls with `requireUnlock`. Test ciphertext validation and arithmetic boundaries. The tutorial holds no user funds and has no privileged admin control.
- User escape: Users retain their own wallets and can call the contract through the documented standalone script or another compatible client.

### Accepted Compromise

The tutorial depends on COTI Testnet and the COTI wallet/plugin/Snap ecosystem to demonstrate gcEVM confidential computation. This is explicit and appropriate for a testnet quickstart; it is not an anonymity or production-availability guarantee.

## Official References

- [COTI Quickstart](https://docs.coti.io/coti-documentation/build-on-coti/quickstart.md)
- [Basic Private Smart Contract](https://docs.coti.io/coti-documentation/build-on-coti/guides/basic-private-smart-contract.md)
- [Sending a Transaction with Encrypted Inputs](https://docs.coti.io/coti-documentation/build-on-coti/guides/sending-a-transaction-with-encrypted-inputs.md)
- [Resolving a Transaction's Encrypted Outputs](https://docs.coti.io/coti-documentation/build-on-coti/guides/resolving-a-transactions-encrypted-outputs.md)
- [COTI MPC Core](https://docs.coti.io/coti-documentation/build-on-coti/tools/contracts-library/mpc-core.md)
- [COTI Wallet Plugin Integration](https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-wallet-plugin/integration-guide.md)

## Progress As Of 2026-09-08

Completed:

- Created the standalone sibling project at `/Users/tekh/rn/coti-garbled-data-quickstart` with `npx create-eth@latest coti-garbled-data-quickstart --solidity-framework hardhat`.
- Installed the generated dependencies with Yarn 4.13.0.
- Ran the generated baseline checks successfully: `yarn lint`, `yarn compile`, and `yarn next:build`.
- Created the local-only `coti-garbled-data-quickstart` branch.
- Created baseline commit `8ee8be4` (`Baseline: create-eth app scaffold`).
- Started `yarn chain`, deployed with `yarn deploy`, and confirmed deployment of the generated `YourContract` to the local Hardhat network.
- Started `yarn start` and confirmed the frontend served `/` successfully at `http://localhost:3000`.
- Stopped the local Hardhat chain and Next.js server after validation.

Current state:

- No COTI contract, wallet plugin, frontend integration, or testnet configuration has been implemented yet.
- The sibling branch has an uncommitted generated ABI update in `packages/nextjs/contracts/deployedContracts.ts` from the local deployment.
- The original repository remains separate from the sibling project; no ScribeCast changes were copied into the new project.

Next implementation constraint:

- Preserve the working local Hardhat deploy and frontend startup path while adding COTI support incrementally. The generated contract should remain available until the replacement deployment and UI path have been compiled and tested.
