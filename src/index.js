import { RestClientV5 } from 'bybit-api';
import dotenv from 'dotenv';
import Decimal from 'decimal.js';

dotenv.config();

const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: false,
});

const SYMBOL = 'DEEPUSDT';
const tradePairs = parseInt(process.env.TRADE_PAIRS) || 3;
const balancePercentage = new Decimal(process.env.BALANCE_PERCENTAGE || 10).div(100);

async function getBalance(asset) {
  const { result } = await client.getWalletBalance({
    accountType: 'SPOT',
    coin: asset,
  });
  return new Decimal(result.list[0]?.totalWalletBalance || '0');
}

async function createOrder(side, quantity) {
  try {
    const order = await client.submitOrder({
      category: 'spot',
      symbol: SYMBOL,
      side: side,
      orderType: 'Market',
      qty: quantity.toString(),
    });
    
    console.log(`${side} order placed:`, order.result);
    return order;
  } catch (error) {
    console.error(`Error placing ${side} order:`, error.message);
    throw error;
  }
}

async function executeTradingPairs() {
  try {
    // Get current DEEP balance
    const deepBalance = await getBalance('DEEP');
    // Get current USDT balance
    const usdtBalance = await getBalance('USDT');
    
    console.log('Current balances:');
    console.log('DEEP:', deepBalance.toString());
    console.log('USDT:', usdtBalance.toString());

    // Calculate trade amounts
    const deepTradeAmount = deepBalance.mul(balancePercentage).div(tradePairs);
    const usdtTradeAmount = usdtBalance.mul(balancePercentage).div(tradePairs);

    console.log(`\nExecuting ${tradePairs} trading pairs`);
    console.log(`Amount per trade: ${deepTradeAmount.toString()} DEEP / ${usdtTradeAmount.toString()} USDT`);

    for (let i = 0; i < tradePairs; i++) {
      console.log(`\nExecuting pair ${i + 1}/${tradePairs}`);
      
      // Place buy order
      await createOrder('Buy', usdtTradeAmount);
      
      // Place sell order
      await createOrder('Sell', deepTradeAmount);
      
      // Wait 2 seconds between pairs
      if (i < tradePairs - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\nAll trading pairs executed successfully');
  } catch (error) {
    console.error('Error executing trading pairs:', error.message);
  }
}

// Start the trading bot
console.log('Starting Bybit Trading Bot...');
executeTradingPairs();