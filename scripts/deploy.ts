import { ethers } from "hardhat";

async function main() {
  const stk = await ethers.deployContract("StakeToken", [
    "StakeToken",
    "STK",
    1_000_000,
  ]);

  await stk.waitForDeployment();

  console.log(`StakeToken deployed to ${stk.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
