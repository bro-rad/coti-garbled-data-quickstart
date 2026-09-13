"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import { useAccount, useSwitchChain } from "wagmi";
import { cotiTestnet } from "~~/scaffold.config";

export default function PrivateCounterPage() {
  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const isCotiTestnet = chainId === cotiTestnet.id;

  return (
    <div className="flex-1 bg-base-200 px-5 py-10 sm:px-8">
      <main className="mx-auto grid w-full max-w-3xl gap-6">
        <header>
          <p className="text-sm font-semibold text-primary">COTI Testnet</p>
          <h1 className="mt-2 text-3xl font-bold">Private Counter</h1>
          <p className="mt-2 max-w-2xl text-base-content/70">
            The contract accepts a COTI encrypted input: a ciphertext integer and its wallet signature. It returns
            ciphertext, not a public counter value.
          </p>
        </header>

        {!isConnected && <div className="alert">Connect a wallet from the header to continue.</div>}

        {isConnected && !isCotiTestnet && (
          <div className="alert alert-warning flex flex-wrap justify-between gap-3">
            <span>Switch to COTI Testnet to access the deployed PrivateCounter.</span>
            <button className="btn btn-sm" onClick={() => switchChain({ chainId: cotiTestnet.id })}>
              Switch network
            </button>
          </div>
        )}

        {isConnected && isCotiTestnet && (
          <>
            <section className="rounded-lg border border-base-300 bg-base-100 p-5">
              <p className="font-semibold">Connected wallet</p>
              <Address address={address} chain={cotiTestnet} />
            </section>
            <section className="rounded-lg border border-base-300 bg-base-100 p-5">
              <p className="font-semibold">Developer exercise</p>
              <p className="mt-2 text-base-content/70">
                Use Debug Contracts to submit an encrypted input produced by the local `coti:counter` script. The
                browser does not request or retain your AES key.
              </p>
              <Link className="btn btn-primary mt-4" href="/debug">
                Open Debug Contracts
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
