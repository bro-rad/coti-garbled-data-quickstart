import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async env => {
    if (env.name !== "coti" && env.name !== "cotiTestnet") {
      return;
    }

    const { deployer } = env.namedAccounts;
    const privateCounter = await env.deploy("PrivateCounter", {
      account: deployer,
      artifact: artifacts.PrivateCounter,
    });

    console.log("PrivateCounter deployed at:", privateCounter.address);
  },
  {
    tags: ["PrivateCounter"],
  },
);
