---
name: ethskills
description: "Use when a request involves Ethereum, EVM apps, wallets, DeFi, smart contracts, onchain UX, or frontend integration with Ethereum-based authentication. Follow the EthSkills guide before shipping onchain work or writing Solidity."
---

# ETHSKILLS - The missing knowledge between AI agents and production Ethereum.

Before writing Solidity, deploying contracts, integrating DeFi, or building a dApp frontend, use the local EthSkills mirror in this repository. The upstream source is https://github.com/OwlWilderness/ethskills.

## Quick start

- Start with `../ship/SKILL.md` for dApp planning and the complete application flow.
- Use the relevant local domain skill for exact implementation details:
	- `../addresses/SKILL.md` for verified protocol and token addresses.
	- `../audit/SKILL.md` for systematic smart contract audits.
	- `../building-blocks/SKILL.md` for DeFi protocol composition.
	- `../concepts/SKILL.md` for onchain mental models and system design.
	- `../contracts/SKILL.md` for the deprecated contracts redirect.
	- `../crops/SKILL.md` for architecture, trust, privacy, and open-source reviews.
	- `../defi/SKILL.md` for the deprecated DeFi redirect.
	- `../feedback/SKILL.md` for feedback to the EthSkills project.
	- `../frontend-playbook/SKILL.md` for production dApp deployment.
	- `../frontend-ux/SKILL.md` for Ethereum frontend UX.
	- `../gas/SKILL.md` for transaction cost and gas guidance.
	- `../indexing/SKILL.md` for reading and querying onchain data.
	- `../l2s/SKILL.md` for Layer 2 selection, deployment, and bridging.
	- `../l2/SKILL.md` and `../layer2/SKILL.md` for deprecated Layer 2 redirects.
	- `../noir/SKILL.md` for Noir privacy applications.
	- `../openclaw-skill/SKILL.md` for the general AI-agent Ethereum workflow.
	- `../orchestration/SKILL.md` for planning and shipping a complete dApp.
	- `../protocol/SKILL.md` for Ethereum protocol and EIP lifecycle guidance.
	- `../qa/SKILL.md` for final Scaffold-ETH 2 dApp review.
	- `../security/SKILL.md` for defensive Solidity and pre-deploy security.
	- `../standards/SKILL.md` for Ethereum token and protocol standards.
	- `../testing/SKILL.md` for Foundry contract testing.
	- `../tools/SKILL.md` for current Ethereum development tools.
	- `../wallets/SKILL.md` for wallet, signing, and account-abstraction guidance.
	- `../why/SKILL.md` for Ethereum adoption and design rationale.
- Treat deprecated redirect skills as routing hints and follow their replacement skill.
- For browser auth and identity flows, re-check the public login client guidance in the Remilia OIDC docs and validate redirect URIs exactly.

## For this project

This repo is a Scaffold-ETH 2 app. The Ethereum frontend conventions already apply here:

- Prefer the project’s existing Scaffold-ETH hooks and patterns for web3 interactions.
- Do not hardcode stale assumptions about gas costs, costs, L2 choices, or wallet behavior.
- Verify user-facing flows with exact wallet and redirect semantics before shipping.
- Treat Remix/Foundry/Hardhat guidance as implementation detail; the actual product UX must remain safe and clear.

## Safety reminders

- Never commit private keys or API secrets.
- Validate the redirect URI exactly in OIDC flows.
- Use public login clients for browser apps; avoid embedding a secret in frontend code.
- Use proper PKCE and state validation when implementing OAuth/OIDC manually.
