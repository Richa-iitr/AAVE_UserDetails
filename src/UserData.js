import Web3 from "web3";
import BigNumber from "bignumber.js";

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://polygon-mumbai.g.alchemy.com/v2/6OXarysKYq0scJx1uP8RPXxW43Q_eMRj"
  )
);

const LP_ABI = [
  {
    inputs: [],
    name: "getReservesList",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { internalType: "uint256", name: "totalCollateralETH", type: "uint256" },
      { internalType: "uint256", name: "totalDebtETH", type: "uint256" },
      { internalType: "uint256", name: "availableBorrowsETH", type: "uint256" },
      {
        internalType: "uint256",
        name: "currentLiquidationThreshold",
        type: "uint256",
      },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "healthFactor", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const PD_ABI = [
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserReserveData",
    outputs: [
      {
        internalType: "uint256",
        name: "currentATokenBalance",
        type: "uint256",
      },
      { internalType: "uint256", name: "currentStableDebt", type: "uint256" },
      { internalType: "uint256", name: "currentVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "principalStableDebt", type: "uint256" },
      { internalType: "uint256", name: "scaledVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "liquidityRate", type: "uint256" },
      { internalType: "uint40", name: "stableRateLastUpdated", type: "uint40" },
      { internalType: "bool", name: "usageAsCollateralEnabled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllReservesTokens",
    outputs: [
      {
        components: [
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "address", name: "tokenAddress", type: "address" },
        ],
        internalType: "struct AaveProtocolDataProvider.TokenData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveConfigurationData",
    outputs: [
      { internalType: "uint256", name: "decimals", type: "uint256" },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      {
        internalType: "uint256",
        name: "liquidationThreshold",
        type: "uint256",
      },
      { internalType: "uint256", name: "liquidationBonus", type: "uint256" },
      { internalType: "uint256", name: "reserveFactor", type: "uint256" },
      { internalType: "bool", name: "usageAsCollateralEnabled", type: "bool" },
      { internalType: "bool", name: "borrowingEnabled", type: "bool" },
      { internalType: "bool", name: "stableBorrowRateEnabled", type: "bool" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "bool", name: "isFrozen", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      { internalType: "uint256", name: "availableLiquidity", type: "uint256" },
      { internalType: "uint256", name: "totalStableDebt", type: "uint256" },
      { internalType: "uint256", name: "totalVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "liquidityRate", type: "uint256" },
      { internalType: "uint256", name: "variableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
      {
        internalType: "uint256",
        name: "averageStableBorrowRate",
        type: "uint256",
      },
      { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
      { internalType: "uint256", name: "variableBorrowIndex", type: "uint256" },
      { internalType: "uint40", name: "lastUpdateTimestamp", type: "uint40" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const LPAP_ABI = [
  {
    inputs: [],
    name: "getPriceOracle",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

const PRICEORACLE_ABI = [
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getAssetPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

var USD;
const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const claddr = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, claddr);
await priceFeed.methods
  .latestRoundData()
  .call()
  .then((roundData) => {
    USD = roundData.answer / 1e8;
  });
const CONTRACT_ADDR = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
const PD_CONTR_ADDR = "0xFA3bD19110d986c5e5E9DD5F69362d05035D045B";
const LPAP_CONTR_ADDR = "0x178113104fEcbcD7fF8669a0150721e231F0FD4B";

const contract = new web3.eth.Contract(LP_ABI, CONTRACT_ADDR);
const pdContract = new web3.eth.Contract(PD_ABI, PD_CONTR_ADDR);
const lpapContract = new web3.eth.Contract(LPAP_ABI, LPAP_CONTR_ADDR);

const user = "0x15C6b352c1F767Fa2d79625a40Ca4087Fab9a198";

await getUserDetails();

async function getUserDetails() {
  let map = new Map();        //stores symbol of asset
  let decimal = new Map();    //decimal of each asset

  // getting total supply, total borrow and other details of assets owned by user
  await contract.methods
    .getUserAccountData(user.toLowerCase())
    .call()
    .then((details) => {
      console.log(
        `totalSupply: ${BigNumber(details.totalCollateralETH)
          .div(1e18)
          .times(USD)} USD`
      );
      console.log(
        `totalBorrows: ${BigNumber(details.totalDebtETH)
          .div(1e18)
          .times(USD)} USD`
      );
      console.log(
        `availableBorrows: ${BigNumber(details.availableBorrowsETH)
          .div(1e18)
          .times(USD)} USD`
      );
      console.log(`healthFactor: ${BigNumber(details.healthFactor).div(1e18)}`);
      console.log(
        `LiquidationThreshold: ${details.currentLiquidationThreshold / 100}%`
      );
      console.log(`LoanToValue: ${details.ltv / 100}%\n`);
    });

  await pdContract.methods
    .getAllReservesTokens()
    .call()
    .then((objects) => {
      for (let i = 0; i < objects.length; i++) {
        map.set(objects[i].tokenAddress.toLowerCase(), objects[i].symbol);
      }
    });

  let arr = [];

  //get list of active reserves
  await contract.methods
    .getReservesList()
    .call()
    .then((list) => {
      arr.push(list);
    });
  var ltLT = new Map();
  for (let i = 0; i < arr[0].length; i++)
    await pdContract.methods
      .getReserveConfigurationData(arr[0][i].toLowerCase())
      .call()
      .then((data) => {
        decimal.set(arr[0][i].toLowerCase(), data.decimals);
        ltLT.set(arr[0][i].toLowerCase(), {
          ltv: data.ltv / 10000,
          liquidationThreshold: data.liquidationThreshold / 10000,
        });
      });

  //get details of reserves borrowed or deposited by user
  //getting the supply and deposit of individual assets for a user
  let results = [];
  var stable = new Map();
  for (let i = 0; i < arr[0].length; i++) {
    let addr = arr[0][i].toLowerCase();
    await pdContract.methods
      .getUserReserveData(addr, user.toLowerCase())
      .call()
      .then((data) => {
        results.push({
          address: addr,
          totalSupply: BigNumber(
            BigNumber(data.currentATokenBalance).div(10 ** decimal.get(addr))
          ).toPrecision(18),
          totalBorrows: BigNumber(
            BigNumber(data.currentStableDebt).plus(
              BigNumber(data.currentVariableDebt)
            )
          )
            .div(10 ** decimal.get(addr))
            .toPrecision(18),
        });
        stable.set(addr, BigNumber(data.stableBorrowRate).toFixed());
      });
  }

  //getting price of tokens
  //get the latest oracle
  var priceOracleAddr;
  await lpapContract.methods
    .getPriceOracle()
    .call()
    .then((addr) => {
      priceOracleAddr = addr;
    });
  // console.log(`\nPrices of tokens \n`);

  var res = new Map();
  for (let i = 0; i < arr[0].length; i++) {
    await pdContract.methods
      .getReserveData(arr[0][i].toLowerCase())
      .call()
      .then((obj) => {
        var borrow;
        if (stable.get(arr[0][i].toLowerCase()) != 0) {
          borrow = stable.get(arr[0][i].toLowerCase());
        } else {
          borrow = BigNumber(obj.variableBorrowRate)
            .div(1e27)
            .toFixed();
        }
        res.set(arr[0][i].toLowerCase(), {
          symbol: map.get(arr[0][i].toLowerCase()),
          supplyRate: BigNumber(obj.liquidityRate)
            .div(1e27)
            .toNumber(),
          borrowRate: borrow,
        });
      });
    Object.assign(
      res.get(arr[0][i].toLowerCase()),
      ltLT.get(arr[0][i].toLowerCase())
    );
  }
  const poContract = new web3.eth.Contract(PRICEORACLE_ABI, priceOracleAddr);
  for (let i = 0; i < arr[0].length; i++) {
    await poContract.methods
      .getAssetPrice(arr[0][i].toLowerCase())
      .call()
      .then((price) => {
        Object.assign(res.get(arr[0][i].toLowerCase()), {
          priceInUSD: BigNumber(price).div(1e18).times(USD).toFixed(),
          priceInETH: BigNumber(price).div(1e18).toFixed(),
        });
      });
  }
  for (let i = 0; i < results.length; i++) {
    Object.assign(res.get(results[i].address), {
      supply: results[i].totalSupply,
      borrow: results[i].totalBorrows,
      maxBorrowLimit: BigNumber(results[i].totalSupply).times(
        res.get(results[i].address).ltv
      ).toFixed(),
      maxLiquidationBorrowLimit: BigNumber(results[i].totalSupply).times(
        res.get(results[i].address).liquidationThreshold
      ).toFixed(),
    });
  }
  
  console.log(Array.from(res.values()));
}
