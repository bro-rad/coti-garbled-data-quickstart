# COTI Garbled Data Quickstart

This standalone Scaffold-ETH 2 project demonstrates a wallet-owned COTI encrypted counter on COTI Testnet. Each connected account has a separate encrypted total; the contract never exposes the plaintext increment or total.

> [!NOTE]
> 🤖 Scaffold-ETH 2 is AI-ready! It has everything agents need to build on Ethereum. Check `.agents/`, `.claude/`, `.opencode` or `.cursor/` for more info.

Built with Next.js, RainbowKit, Wagmi, Viem, TypeScript, Hardhat, and COTI's confidential arithmetic libraries.

## Current Status

The contract compiles under the COTI profile and the direct Testnet exercise supports encrypted increments and decrements. Punk Wallet exposes the COTI private RPC methods needed by the browser over its existing WalletConnect session. The quickstart browser page still needs to be switched from the Debug Contracts fallback to those methods.

The deployed COTI Testnet metadata is stale after the account-scoped `PrivateCounter` change. Redeploy and regenerate the frontend ABI before using the changed contract on Testnet.

## COTI Testnet

| Item | Value |
| --- | --- |
| Chain ID | `7082400` |
| RPC | `https://testnet.coti.io/rpc` |
| Explorer | `https://testnet.cotiscan.io` |
| Native token | `COTI` |

Fund the deployer and test wallet from the official COTI Testnet faucet. This project is testnet-only and is not an anonymity or production-availability guarantee.

## Run

```bash
yarn install
yarn compile
yarn hardhat:test
yarn start
```

For the COTI compiler profile:

```bash
cd packages/hardhat
npx hardhat compile --build-profile coti
```

Run the direct encrypted exercise only with an explicitly configured local test account and AES setup:

```bash
yarn coti:aes --network cotiTestnet
yarn coti:counter --increment 3
yarn coti:counter --decrement 1
```

The script is an escape route for debugging and automation. It is not a replacement for wallet-owned browser custody.

## Wallet Boundary

Run Punk Wallet separately on port `3001` and the quickstart on port `3000`:

```bash
cd /Users/tekh/rn/punk-wallet
PORT=3001 yarn start
```

Connect the quickstart to Punk Wallet using the existing WalletConnect flow. The wallet owns onboarding, AES recovery, lock/unlock, rotation, encryption, and decryption. The quickstart may call `coti_getStatus`, `coti_unlock`, `coti_lock`, `coti_encryptValue`, `coti_decryptValue`, and `coti_rotateAes`, but it must never receive or persist plaintext AES material.

Private values remain visible only while the wallet session is unlocked. Sender address, target contract, method selector, transaction existence, timing, gas payer, and general RPC interaction metadata remain observable.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`


## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.