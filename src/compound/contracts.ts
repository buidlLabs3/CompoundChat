/**
 * Compound V3 contract addresses and ABIs
 */

export const COMPOUND_V3_SEPOLIA = {
  USDC_COMET: '0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e',
  cUSDCV3: '0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e',
};

export const COMPOUND_V3_MAINNET = {
  USDC_COMET: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
  ETH_COMET: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
};

// Minimal Comet ABI for supply/withdraw operations
export const COMET_ABI = [
  'function supply(address asset, uint amount)',
  'function withdraw(address asset, uint amount)',
  'function balanceOf(address account) view returns (uint256)',
  'function borrowBalanceOf(address account) view returns (uint256)',
  'function getSupplyRate(uint utilization) view returns (uint64)',
  'function getUtilization() view returns (uint)',
  'function baseToken() view returns (address)',
];

// ERC20 ABI for token operations
export const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// Token addresses on Sepolia testnet
export const SEPOLIA_TOKENS = {
  USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
};

// Token addresses on mainnet
export const MAINNET_TOKENS = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
};


