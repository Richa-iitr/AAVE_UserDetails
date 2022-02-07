import Web3 from "web3";
import BigNumber from "bignumber.js";

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    process.env.POLYGON_KEY
  )
);

const ABI = [
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
const USD = 3083.70;
const CONTRACT_ADDR = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";

const contract = new web3.eth.Contract(ABI, CONTRACT_ADDR);

const user = "0x15C6b352c1F767Fa2d79625a40Ca4087Fab9a198";

await getUserDetails();

async function getUserDetails() {
  let map = new Map();
  await contract.methods
    .getUserAccountData(user.toLowerCase())
    .call()
    .then((details) => {
      console.log(`totalSupply: ${BigNumber(details.totalCollateralETH).div(1e18).times(USD)} USD`); 
      console.log(`totalBorrows: ${BigNumber(details.totalDebtETH).div(1e18).times(USD)} USD`);
      console.log(`availableBorrows: ${BigNumber(details.availableBorrowsETH).div(1e18).times(USD)} USD`);
      console.log(`healthFactor: ${BigNumber(details.healthFactor).div(1e18)}`);
      console.log(`LiquidationThreshold: ${details.currentLiquidationThreshold}`);
      console.log(`LoanToValue: ${details.ltv}`);
    });

}
