import "dotenv/config";
import password from "@inquirer/password";
import { Contract, CotiNetwork, Wallet, getDefaultProvider } from "@coti-io/coti-ethers";
import { Wallet as EthersWallet, hexlify } from "ethers";
import privateCounterDeployment from "../deployments/cotiTestnet/PrivateCounter.json";

const MAX_UINT64 = (1n << 64n) - 1n;
const isPrepareOnly = process.argv.includes("--prepare-only");

function getIncrement() {
  const incrementIndex = process.argv.indexOf("--increment");
  const incrementValue = incrementIndex === -1 ? "1" : process.argv[incrementIndex + 1];

  if (!incrementValue || !/^\d+$/.test(incrementValue)) {
    throw new Error("`--increment` must be an unsigned integer.");
  }

  const increment = BigInt(incrementValue);
  if (increment > MAX_UINT64) {
    throw new Error("`--increment` must fit in uint64.");
  }

  return increment;
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

  const increment = getIncrement();
  const passphrase = await password({ message: "Enter password to decrypt private key:" });
  const decryptedWallet = await EthersWallet.fromEncryptedJson(encryptedKey, passphrase);
  const wallet = new Wallet(decryptedWallet.privateKey, getDefaultProvider(CotiNetwork.Testnet));
  wallet.setAesKey(aesKey);

  const counter = new Contract(privateCounterDeployment.address, privateCounterDeployment.abi, wallet);
  const add = counter.getFunction("add");
  const encryptedIncrement = await wallet.encryptValue(increment, counter.target.toString(), add.fragment.selector);

  if (isPrepareOnly) {
    console.log("Prepared COTI encrypted input. Submit it from the same account that created this signature.");
    console.log(`Ciphertext integer: ${encryptedIncrement.ciphertext}`);
    console.log(`COTI input signature: ${hexlify(encryptedIncrement.signature)}`);
    return;
  }

  console.log(`Submitting an encrypted increment to ${privateCounterDeployment.address}.`);
  const receipt = await (await add(encryptedIncrement)).wait();
  const encryptedTotal = await counter.getFunction("sum").staticCall();
  const decryptedTotal = await wallet.decryptValue(encryptedTotal);

  console.log(`Transaction confirmed: ${receipt?.hash}`);
  console.log(`Decrypted counter total: ${decryptedTotal}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
