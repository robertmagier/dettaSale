const Web3 = require("web3"); // 1.0.0-beta.34
const ethers = require("ethers");

// const ganache = require("ganache-cli");
const ethProvider = new ethers.providers.JsonRpcProvider();

var BN = web3.utils.BN;
var BigNumber = require("bignumber.js");
var DettaSale = artifacts.require("./DettaSale");
var DettaToken = artifacts.require("./EIP20");

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
expect = chai.expect;
var tokenInstance, saleInstance;

contract("Deta Sale", function (accounts) {
  const owner = {
    public: accounts[0],
  };
  const user = {
    public: accounts[1],
  };

  const buyerAccount = accounts[2];

  async function changeTime(time) {
    await ethProvider.send("evm_mine", [time]);
  }
  //////////////
  //  Basics  //
  //////////////

  it("Detta Token Deployed", async function () {
    await changeTime(1);
    let block = await ethProvider.getBlock("latest");
    console.log("Block:", block);
    const initialAmount = (100 * 10 ** 18).toString();
    const tokenName = "Test DETTA";
    const decimals = 18;
    const tokenSymbol = "TDETTA";
    tokenInstance = await DettaToken.new(
      initialAmount,
      tokenName,
      decimals,
      tokenSymbol,
      { from: owner.public }
    );
    expect(tokenInstance).to.be.not.undefined;
    console.log(`Deployed Token ${tokenSymbol} at ${tokenInstance.address}`);
  });
  it("Detta Sale deployed", async function () {
    let hardCap = 10;
    let softCap = 1;
    let rate = 100;
    let wallet = user.public;
    let token = tokenInstance.address;
    let startTime = 10;
    let endTime = 100;
    let block = await ethProvider.getBlock("latest");

    console.log("Block:", block);

    saleInstance = await DettaSale.new(
      hardCap,
      softCap,
      rate,
      wallet,
      token,
      startTime,
      endTime,
      {
        from: owner.public,
      }
    );

    let time = await saleInstance.blockTime();
    console.log("Block time from blockchain:", time.toString());
    expect(saleInstance).to.be.not.undefined;
    console.log(`Deployed Sale Contract  at ${saleInstance.address}`);
    block = await ethProvider.getBlock("latest");
    console.log("Block:", block);

    let balance = await ethProvider.getBalance(wallet);
    console.log("Balance:", balance.toString());
  });

  it("Transfer Tokens to sale contract", async function () {
    await tokenInstance.transfer(saleInstance.address, 500, {
      from: owner.public,
    });
    let balance = await tokenInstance.balanceOf(saleInstance.address);
    expect(balance.toString()).to.be.equal("500");
  });

  it("Buy Tokens above hardcap. Should be rejected.", async function () {
    changeTime(10);
    await expect(
      saleInstance.sendTransaction({
        from: buyerAccount,
        value: 2,
      })
    ).to.be.eventually.rejected;
    await expect(
      saleInstance.sendTransaction({
        from: buyerAccount,
        value: 4,
      })
    ).to.be.eventually.rejected;

    await expect(
      saleInstance.sendTransaction({
        from: buyerAccount,
        value: 3,
      })
    ).to.be.eventually.fulfilled

    let balance = await tokenInstance.balanceOf(buyerAccount);
    expect(balance.toString()).to.be.equal("300");
  });
});
