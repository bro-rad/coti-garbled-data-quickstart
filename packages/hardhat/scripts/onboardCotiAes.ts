import "dotenv/config";
import password from "@inquirer/password";
import { CotiNetwork, Wallet, getDefaultProvider } from "@coti-io/coti-ethers";
import { Wallet as EthersWallet } from "ethers";
import { existsSync, readFileSync, writeFileSync } from "fs";

const cotiNetworks = {
  coti: { aesKeyEnvironmentVariable: "COTI_MAINNET_AES_KEY", network: CotiNetwork.Mainnet },
  cotiTestnet: { aesKeyEnvironmentVariable: "COTI_TESTNET_AES_KEY", network: CotiNetwork.Testnet },
} as const;

type CotiNetworkName = keyof typeof cotiNetworks;
const envFilePath = "./.env";

function setEnvironmentValue(name: string, value: string) {
  const environment = existsSync(envFilePath) ? readFileSync(envFilePath, "utf8") : "";
  const linePattern = new RegExp(`^${name}=.*$`, "m");
  const updatedEnvironment = linePattern.test(environment)
    ? environment.replace(linePattern, `${name}=${value}`)
    : `${environment}${environment.endsWith("\n") || !environment ? "" : "\n"}${name}=${value}\n`;

  writeFileSync(envFilePath, updatedEnvironment);
}

function assertAesKey(aesKey: string) {
  if (!/^[0-9a-fA-F]{32}$/.test(aesKey)) {
    throw new Error("The COTI AES key must contain 32 hexadecimal characters without a 0x prefix.");
  }
}

function getNetworkName(): CotiNetworkName {
  const networkIndex = process.argv.indexOf("--network");
  const networkName = networkIndex === -1 ? undefined : process.argv[networkIndex + 1];

  if (networkName === "coti" || networkName === "cotiTestnet") {
    return networkName;
  }

  throw new Error("Specify `--network coti` or `--network cotiTestnet`.");
}

async function main() {
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
  if (!encryptedKey) {
    throw new Error("No deployer account found. Run `yarn generate` or `yarn account:import` first.");
  }

  const networkName = getNetworkName();
  const selectedNetwork = cotiNetworks[networkName];
  const passphrase = await password({ message: "Enter password to decrypt private key:" });
  const decryptedWallet = await EthersWallet.fromEncryptedJson(encryptedKey, passphrase);
  const wallet = new Wallet(decryptedWallet.privateKey, getDefaultProvider(selectedNetwork.network));
  const aesKey = process.env[selectedNetwork.aesKeyEnvironmentVariable];

  if (aesKey) {
    assertAesKey(aesKey);
    wallet.setAesKey(aesKey);
    console.log(`Loaded the local COTI AES key for ${networkName} and ${wallet.address}.`);
    return;
  }

  console.log(`Starting COTI AES onboarding for ${networkName} with ${wallet.address}.`);
  await wallet.generateOrRecoverAes();
  const generatedAesKey = wallet.getUserOnboardInfo()?.aesKey;
  if (!generatedAesKey) {
    throw new Error("COTI onboarding completed without returning an AES key.");
  }

  assertAesKey(generatedAesKey);
  setEnvironmentValue(selectedNetwork.aesKeyEnvironmentVariable, generatedAesKey);
  console.log(`Created and stored the local ${selectedNetwork.aesKeyEnvironmentVariable} value in .env.`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
