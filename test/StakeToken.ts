import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("StakeToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deploy() {
    const [admin, john, jane] = await ethers.getSigners();

    const StakeToken = await ethers.getContractFactory("StakeToken");

    const stk = await StakeToken.deploy("StakeToken", "STK", 1_000_000_000);

    return { admin, john, jane, stk };
  }

  describe("Admin", function () {
    it("mints additional tokens", async function () {
      const { stk } = await loadFixture(deploy);
      stk.mint(1_000_000_000_000); // mint
    });

    it("cannont not mint if not admin", async function () {
      const { stk, john } = await loadFixture(deploy);
      await expect(stk.connect(john).mint(10_000_000)).to.be.revertedWith(
        "You are not permitted to perfom this action"
      );
    });
  });

  describe("Jane", function () {
    it("tries to stake an insufficient amount of tokens", async function () {
      const { jane, stk } = await loadFixture(deploy);
      stk.transfer(jane.address, 1_000_000);

      await expect(stk.connect(jane).stake(10_000)).to.be.revertedWith(
        "Amount must be greater than 100"
      );
    });

    it("tries to stake tokens while already having a stake", async function () {
      const { jane, stk } = await loadFixture(deploy);
      stk.transfer(jane.address, 1_000_000);

      await stk.connect(jane).stake(200_000);

      await expect(stk.connect(jane).stake(250_000)).to.be.revertedWith(
        "Already staked"
      );
    });

    it("stakes tokens", async function () {
      const { jane, stk } = await loadFixture(deploy);

      await stk.transfer(jane.address, 100_000);
      await stk.connect(jane).stake(100_000);
      const balance = await stk.balanceOf(jane.address);
      expect(balance).to.equal(0);
    });
  });

  describe("John", function () {
    it("tries to unstake without having any staked tokens", async function () {
      const { john, stk } = await loadFixture(deploy);

      await expect(stk.connect(john).unstake()).to.be.revertedWith(
        "No staked token"
      );
    });

    it("unstakes tokens", async function () {
      const { john, stk } = await loadFixture(deploy);
      const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
      const stake = 200_000;

      await stk.transfer(john.address, stake);
      const reward = await stk.calculateReward(stake, ONE_YEAR_IN_SECS);

      await stk.connect(john).stake(stake);

      const unstakeTime = (await time.latest()) + ONE_YEAR_IN_SECS;
      await time.increaseTo(unstakeTime);

      await stk.connect(john).unstake();
      const balance = await stk.balanceOf(john.address);
      expect(balance).to.equal(Number(reward) + stake);
    });
  });
});
