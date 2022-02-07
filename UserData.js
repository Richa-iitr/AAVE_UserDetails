import Web3 from "web3";
import BigNumber from "bignumber.js";

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    process.env.POLYGON_KEY
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
];
const USD = 3083.7;
const CONTRACT_ADDR = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
const PD_CONTR_ADDR = "0xFA3bD19110d986c5e5E9DD5F69362d05035D045B";

const contract = new web3.eth.Contract(LP_ABI, CONTRACT_ADDR);
const pdContract = new web3.eth.Contract(PD_ABI, PD_CONTR_ADDR);

const user = "0x15C6b352c1F767Fa2d79625a40Ca4087Fab9a198";

await getUserDetails();

async function getUserDetails() {
  let map = new Map();
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
        `LiquidationThreshold: ${details.currentLiquidationThreshold}`
      );
      console.log(`LoanToValue: ${details.ltv}`);
    });

  await pdContract.methods.getAllReservesTokens().call()
    .then((objects) => {
      for(let i=0 ; i<objects.length ; i++ ){
        map.set(objects[i].tokenAddress.toLowerCase(), objects[i].symbol)
      }
      // console.log(map);
    });
  
  console.log();
  console.log(`Asset Wise SUPPLIES And BORROWS:`);
  console.log();
  let arr = [];
  await contract.methods
    .getReservesList()
    .call()
    .then((list) => {
      arr.push(list);
    });

    // console.log(arr);
  let results = [];
  for (let i = 0; i < arr[0].length; i++) {
    let addr = arr[0][i].toLowerCase();
    await pdContract.methods
      .getUserReserveData(addr, user.toLowerCase())
      .call()
      .then((data) => {
        results.push({
          address: arr[0][i].toLowerCase(),
          totalSupply: BigNumber(BigNumber(data.currentATokenBalance).div(1e18)).toPrecision(18),
          totalBorrows: BigNumber(
            BigNumber(data.currentStableDebt).plus(
              BigNumber(data.currentVariableDebt)
            )
          )
            .div(1e18).toPrecision(18),
        });
      });
  }

  for (let i = 0; i < results.length; i++) {
    let asset = map.get(results[i].address);
    console.log(
      `Asset:[${asset}] --> totalSupply: ${results[i].totalSupply} --> totalBorrows: ${results[i].totalBorrows}`
    );
  }
}
