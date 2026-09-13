"use client";

// @refresh reset
import { useState } from "react";
import { Contract } from "@scaffold-ui/debug-contracts";
import type { Abi } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { cotiTestnet } from "~~/scaffold.config";
import type { ContractName, GenericContract } from "~~/utils/scaffold-eth/contract";

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

function CotiPrivateCounterDebug({ contract }: { contract: GenericContract }) {
  const [ciphertext, setCiphertext] = useState("");
  const [signature, setSignature] = useState("");
  const [inputError, setInputError] = useState<string>();
  const { data: encryptedSum, isLoading: isReading } = useReadContract({
    address: contract.address,
    abi: contract.abi as Abi,
    functionName: "sum",
    chainId: cotiTestnet.id,
  });
  const { data: transactionHash, isPending, writeContractAsync } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const submitEncryptedInput = async () => {
    if (!/^\d+$/.test(ciphertext) || !/^0x[0-9a-fA-F]*$/.test(signature)) {
      setInputError("Enter a decimal ciphertext and a 0x-prefixed signature.");
      return;
    }

    setInputError(undefined);
    try {
      await writeContractAsync({
        address: contract.address,
        abi: contract.abi as Abi,
        chainId: cotiTestnet.id,
        functionName: "add",
        args: [{ ciphertext: BigInt(ciphertext), signature }],
      });
    } catch {
      setInputError("The encrypted input transaction was rejected or reverted.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0 font-sans">
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-sui-base-100 border-sui-primary-subtle dark:border-sui-primary border shadow-md shadow-sui-primary-subtle px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex flex-col gap-1">
              <span className="font-bold">PrivateCounter</span>
              <span className="font-mono text-sm break-all">{contract.address}</span>
              <p className="my-0 text-sm">
                <span className="font-bold">Network</span>: COTI Testnet
              </p>
              <a
                className="link link-primary text-sm"
                href={`${cotiTestnet.blockExplorers.default.url}/address/${contract.address}`}
                target="_blank"
                rel="noreferrer"
              >
                View contract on COTIScan
              </a>
            </div>
          </div>
          <div className="bg-sui-primary-subtle dark:bg-sui-primary px-6 lg:px-8 py-4 shadow-lg shadow-sui-primary-subtle dark:shadow-sui-primary overflow-y-auto">
            <p className="my-0 text-sm">Encrypted output is shown as ciphertext only.</p>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="z-10">
            <div className="bg-sui-base-100 shadow-md shadow-sui-primary-subtle border border-sui-primary-subtle dark:border-sui-primary flex flex-col mt-10 relative">
              <div className="h-[5rem] w-[5.5rem] bg-sui-primary-subtle dark:bg-sui-primary absolute self-start -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-sui-primary-subtle dark:shadow-sui-primary">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Read</p>
                </div>
              </div>
              <div className="p-5 divide-y divide-sui-primary-subtle">
                <div className="py-3">
                  <p className="my-0 font-semibold">sum</p>
                  <p className="mt-2 break-all font-mono text-sm">
                    {isReading ? "Reading..." : encryptedSum == null ? "Unavailable" : encryptedSum.toString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="bg-sui-base-100 shadow-md shadow-sui-primary-subtle dark:border-sui-primary border border-sui-primary-subtle flex flex-col mt-10 relative">
              <div className="h-[5rem] w-[5.5rem] bg-sui-primary-subtle dark:bg-sui-primary absolute self-start -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-sui-primary-subtle dark:shadow-sui-primary">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Write</p>
                </div>
              </div>
              <div className="p-5 divide-y divide-sui-primary-subtle">
                <div className="space-y-3 py-3">
                  <input
                    className="input input-bordered w-full"
                    inputMode="numeric"
                    placeholder="Ciphertext integer"
                    value={ciphertext}
                    onChange={event => setCiphertext(event.target.value)}
                  />
                  <input
                    className="input input-bordered w-full"
                    placeholder="COTI input signature (0x...)"
                    value={signature}
                    onChange={event => setSignature(event.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={isPending || isConfirming || !ciphertext || !signature}
                    onClick={submitEncryptedInput}
                  >
                    {isPending || isConfirming ? "Submitting..." : "Submit encrypted input"}
                  </button>
                  {inputError && <p className="text-error text-sm">{inputError}</p>}
                  {confirmationError && <p className="text-error text-sm">The transaction reverted on COTI Testnet.</p>}
                  {isConfirmed && transactionHash && (
                    <a
                      className="link link-primary text-sm"
                      href={`${cotiTestnet.blockExplorers.default.url}/tx/${transactionHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Transaction confirmed
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ contractName }: ContractUIProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo({ contractName });

  if (deployedContractLoading) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="text-3xl mt-14">
        No contract found by the name of {contractName} on chain {targetNetwork.name}!
      </p>
    );
  }

  if (targetNetwork.id === cotiTestnet.id && (contractName as string) === "PrivateCounter") {
    return <CotiPrivateCounterDebug contract={deployedContractData} />;
  }

  return <Contract contractName={contractName as string} contract={deployedContractData} chainId={targetNetwork.id} />;
};
