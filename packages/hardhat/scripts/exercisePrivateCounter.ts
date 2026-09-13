import "dotenv/config";
import password from "@inquirer/password";
import { Contract, CotiNetwork, Wallet, getDefaultProvider } from "@coti-io/coti-ethers";
import { Wallet as EthersWallet, hexlify } from "ethers";
import privateCounterDeployment from "../deployments/cotiTestnet/PrivateCounter.json";

const MAX_UINT64 = (1n << 64n) - 1n;
const isPrepareOnly = process.argv.includes("--prepare-only");

function getOperation() {
  const incrementIndex = process.argv.indexOf("--increment");
  const decrementIndex = process.argv.indexOf("--decrement");
  if (incrementIndex !== -1 && decrementIndex !== -1) {
    throw new Error("Use either `--increment` or `--decrement`, not both.");
  }

  const isDecrement = decrementIndex !== -1;
  const valueIndex = isDecrement ? decrementIndex : incrementIndex;
  const value = valueIndex === -1 ? "1" : process.argv[valueIndex + 1];

  if (!value || !/^\d+$/.test(value)) {
    throw new Error("The counter value must be an unsigned integer.");
  }

  const amount = BigInt(value);
  if (amount > MAX_UINT64) {
    throw new Error("The counter value must fit in uint64.");
  }

  return { amount, functionName: isDecrement ? "subtract" : "add" } as const;
}

async function main() {
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
  const aesKey = process.env.COTI_TESTNET_AES_KEY;
  if (!encryptedKey) {
    throw new Error("No deployer account found. Run `yarn generate` or `yarn account:import` first.");
  }
  if (!aesKey) {
    throw new Error("No Testnet AES key found. Run `yarn coti:aes --network cotiTestnet` first.");
  }
  if (!/^[0-9a-fA-F]{32}$/.test(aesKey)) {
    throw new Error("COTI_TESTNET_AES_KEY must contain 32 hexadecimal characters without a 0x prefix.");
  }

  const { amount, functionName } = getOperation();
  const passphrase = await password({ message: "Enter password to decrypt private key:" });
  const decryptedWallet = await EthersWallet.fromEncryptedJson(encryptedKey, passphrase);
  const wallet = new Wallet(decryptedWallet.privateKey, getDefaultProvider(CotiNetwork.Testnet));
  wallet.setAesKey(aesKey);

  const counter = new Contract(privateCounterDeployment.address, privateCounterDeployment.abi, wallet);
  const operation = counter.getFunction(functionName);
  const encryptedValue = await wallet.encryptValue(amount, counter.target.toString(), operation.fragment.selector);

  if (isPrepareOnly) {
    console.log(
      `Prepared COTI encrypted ${functionName} input. Submit it from the same account that created this signature.`,
    );
    console.log(`Ciphertext integer: ${encryptedValue.ciphertext}`);
    console.log(`COTI input signature: ${hexlify(encryptedValue.signature as unknown as Uint8Array)}`);
    return;
  }

  console.log(`Submitting an encrypted ${functionName} to ${privateCounterDeployment.address}.`);
  const receipt = await (await operation(encryptedValue)).wait();
  const encryptedTotal = await counter.getFunction("sum").staticCall();
  const decryptedTotal = await wallet.decryptValue(encryptedTotal);

  console.log(`Transaction confirmed: ${receipt?.hash}`);
  console.log(`Decrypted counter total: ${decryptedTotal}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
