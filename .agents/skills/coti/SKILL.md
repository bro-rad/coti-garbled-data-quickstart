---
name: coti
description: Use when developing, configuring, deploying, or reviewing the COTI integration in this Scaffold-ETH 2 repository.
---

# COTI integration for bot.rad

Use this skill together with `../ethskills/SKILL.md` and the relevant local EthSkills domain skill. Review the COTI branch history before changing network or deployment behavior. Official references are the [COTI network docs](https://docs.coti.io/coti-documentation/networks/mainnet.md), [COTI quickstart](https://docs.coti.io/coti-documentation/build-on-coti/quickstart.md), and [COTI contract address lists](https://docs.coti.io/coti-documentation/networks/mainnet/contracts-addresses.md).

## Network definitions

The frontend chain definitions live in `packages/nextjs/scaffold.config.ts`:

- COTI mainnet: chain ID `2632500`, RPC `https://mainnet.coti.io/rpc`, WebSocket `wss://mainnet.coti.io/ws`, explorer `https://mainnet.cotiscan.io`.
- COTI testnet: chain ID `7082400`, RPC `https://testnet.coti.io/rpc`, WebSocket `wss://testnet.coti.io/ws`, explorer `https://testnet.cotiscan.io`.
- Native currency: `COTI`, symbol `COTI`, 18 decimals.

These values are verified against the official COTI network documentation and the committed chain definitions in this repository. Protocol addresses belong in `../addresses/SKILL.md`; do not add unverified application or token addresses here.

## Asset identity

- Ethereum COTI ERC-20: `0xDDB3422497E61e13543BeA06989C0789117555c5`, 18 decimals.
- COTI V2 mainnet and testnet: native `COTI`, 18 decimals, with no ERC-20 contract address for the gas asset.
- Ethereum canonical WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.
- Do not assume WETH exists at that Ethereum address on COTI V2. Verify any wrapped-asset deployment on the target network first.

Keep frontend chain definitions, explorer metadata, network display data, and Hardhat network configuration consistent. Do not invent chain IDs, RPC URLs, explorer URLs, gas assumptions, or contract addresses.

## Hardhat workflow

Hardhat networks are configured in `packages/hardhat/hardhat.config.ts` as `coti` and `cotiTestnet`. Deployment uses the encrypted deployer account flow; never commit private keys or place secrets in tracked files.

When deploying through `packages/hardhat/scripts/runHardhatDeployWithPK.ts`:

- Use `--network coti` or `--network cotiTestnet`.
- The script selects the `coti` build profile for both COTI networks.
- Local `default` and `hardhat` deployments do not require the encrypted deployer account.
- Verify the selected network before sending a deployment transaction.

Typical commands:

```bash
yarn deploy --network coti
yarn deploy --network cotiTestnet
yarn verify --network coti
```

Use the repository's existing package scripts and deployment conventions. Confirm the exact available verification command before running it against a live network.

## Frontend workflow

For frontend work:

- Use the existing Scaffold-ETH hooks and contract abstractions.
- Update `packages/nextjs/scaffold.config.ts` first when adding or changing a COTI chain.
- Keep `packages/nextjs/utils/scaffold-eth/networks.ts` aligned with chain metadata and network colors.
- Check the configured `targetNetworks` and environment variables before assuming the app targets COTI.
- Use COTIScan links for user-facing transaction and address navigation.

## AES ownership and unlock policy

For production-safe COTI integrations, treat AES key handling as a security boundary:

- Keep AES custody wallet-side. The dApp must not receive raw AES material.
- If not using `@coti-io/coti-wallet-plugin`, implement equivalent wallet-owned unlock and private operation controls.
- Require wallet-gated private operations (`unlock`/`lock`/`encrypt`/`decrypt`) before contract interaction that needs private values.
- Bind private session state to wallet account and chain.
- Keep AES plaintext session-only in wallet runtime memory and clear on wallet lock/disconnect.

Important nuance from official docs:

- In plugin flows, active AES material exists only in session-scoped plugin state and is cleared on lock/disconnect.
- App code must not add its own plaintext AES persistence, logging, telemetry capture, or custom storage path.
- A no-plugin architecture is acceptable only if wallet-side custody and unlock semantics are implemented with equivalent rigor.

References:

- https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-wallet-plugin/integration-guide.md
- https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-wallet-plugin/configuration.md
- https://docs.coti.io/coti-documentation/build-on-coti/tools/coti-wallet-plugin/aes-key-onboarding.md

## Onboarding, backup, and wallet support constraints

- Supported onboarding routes are wallet-type dependent (Snap route, encrypted backup restore route, then onboarding/manual entry fallback as documented).
- `isUnlocked` means private balances are visible after refresh; do not infer onboarding or persistent key state from it.
- Signature-derived encrypted backup is compatibility-limited; some wallet classes are not officially supported for deterministic backup restore.
- Remote AES backup is deprecated in official guidance. Use documented onboarding services patterns and treat encrypted backup signatures as sensitive actions.

## Production anti-shortcuts

Do not weaken test flows in ways that would fail production review:

- No plaintext AES key in app or wallet localStorage/sessionStorage/indexedDB or analytics payloads.
- No fake unlock flags or bypasses around wallet-gated private operations.
- No assumptions that controlling the same address always implies backup recoverability.
- Keep lock behavior explicit and test it under account switch, chain switch, and disconnect.

## Punk Wallet mode policy

When using Punk Wallet for COTI private flows:

- Treat throwaway EOA safety and AES safety as separate concerns.
- Support two modes:
	- `Secure Mode` (default): conservative lock behavior and production baseline.
	- `Punk Mode` (user-selected): lower friction with relaxed auto-lock behavior.
- `Punk Mode` may be enabled on Testnet or Mainnet at user discretion.
- Mode persistence is user-controlled; do not auto-disable mode without user action.
- `Punk Mode` must still preserve the security floor:
	- never expose raw AES to dApp,
	- never persist plaintext AES,
	- never log plaintext AES,
	- maintain clear user-visible mode indication.
- Document exactly where wallet keys and encrypted backups are stored for each mode.

## Safety and validation

Before shipping COTI changes:

1. Read `../ship/SKILL.md` and the relevant EthSkills skill, especially `../security/SKILL.md`, `../addresses/SKILL.md`, `../wallets/SKILL.md`, or `../frontend-ux/SKILL.md` as applicable.
2. Check the diff across Hardhat and Next.js network configuration for matching chain IDs and endpoints.
3. Compile and run the narrowest relevant tests before deployment.
4. For live deployments, confirm the network, deployer account, RPC, explorer, and contract addresses independently.
5. Never expose or commit `DEPLOYER_PRIVATE_KEY_ENCRYPTED`, runtime private keys, API keys, or wallet secrets.
6. For private-balance UX, verify unlock/lock semantics and typed error handling in the chosen wallet integration path.
7. Confirm no plaintext AES material appears in app storage, wallet storage, logs, analytics, or debugging output.

## COTI Notes

Network metadata is documented by [COTI MainNet](https://docs.coti.io/coti-documentation/networks/mainnet.md) and [COTI TestNet](https://docs.coti.io/coti-documentation/networks/testnet.md):

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| COTI Mainnet | `2632500` | `https://mainnet.coti.io/rpc` | `https://mainnet.cotiscan.io` |
| COTI Testnet | `7082400` | `https://testnet.coti.io/rpc` | `https://testnet.cotiscan.io` |

COTI V2 uses native `COTI` with 18 decimals as its gas asset; it has no ERC-20 contract address on COTI Mainnet or Testnet. The Ethereum COTI ERC-20 in the Major Tokens table is a different asset representation.

The COTI protocol address list documents `MPCInterface` at `0x0000000000000000000000000000000000000064` and `AccountOnboard` at `0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095` on both COTI networks. Check the [mainnet list](https://docs.coti.io/coti-documentation/networks/mainnet/contracts-addresses.md) or [testnet list](https://docs.coti.io/coti-documentation/networks/testnet/contracts-addresses.md) and the matching COTIScan instance before using protocol, bridge, private-token, or application addresses.

The [COTI bridge documentation](https://docs.coti.io/coti-documentation/coti-bridge.md) lists COTI and gCOTI as supported assets. It does not provide a verified COTI WETH deployment, so the WETH table marks COTI WETH as unverified rather than reusing Ethereum WETH.
