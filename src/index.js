import { RestClientV5 } from 'bybit-api';
import dotenv from 'dotenv';
import Decimal from 'decimal.js';

dotenv.config();

const apiKey = process.env.BYBIT_API_KEY;
const apiSecret = process.env.BYBIT_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("API key and secret are not set. Please check your .env file.");
  process.exit(1);
}

const client = new RestClientV5({
  key: apiKey,
  secret: apiSecret,
  testnet: false,
});

const SYMBOL = 'DEEPUSDT';
const tradePairs = parseInt(process.env.TRADE_PAIRS) || 3;
const balancePercentage = new Decimal(process.env.BALANCE_PERCENTAGE || 10).div(100);


async function getBalance(asset) {
  try {
    // Fetch all balances for the unified account
    const response = await client.getCoinBalance({
      accountType: "UNIFIED",
      coin: asset
    });

    // console.log(`Unified account balance response:`, response);

    return new Decimal(response.result.balance.walletBalance || '0');
  } catch (error) {
    console.error(`Error fetching balance for ${asset}:`, error.message);
    return new Decimal('0');  // Return zero if balance retrieval fails
  }
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
    
    if (!order.result || order.retCode !== 0) {
      throw new Error(`Order failed with return code ${order.retCode}: ${order.retMsg}`);
    }
    
    console.log(`${side} order placed successfully:`, order.result);
    return order;
  } catch (error) {
    console.error(`Error placing ${side} order:`, error);
    throw error;
  }
}

async function executeTradingPairs() {
  try {
    // Get current USDT balance
    const usdtBalance = await getBalance('USDT');
    
    console.log('Current balances:');
    console.log('USDT:', usdtBalance.toString());
    
    // Calculate trade amounts
    const usdtTradeAmount = usdtBalance.mul(balancePercentage).toFixed(2);//.div(tradePairs);
    
    console.log(`\nExecuting ${tradePairs} trading pairs`);
    console.log(`Amount per trade: ${usdtTradeAmount.toString()} USDT`);
    
    for (let i = 0; i < tradePairs; i++) {
      console.log(`\nExecuting pair ${i + 1}/${tradePairs}`);
      
      // Place buy order
      await createOrder('Buy', usdtTradeAmount);

      //await new Promise(resolve => setTimeout(resolve, 5000));
      // Get current DEEP balance
      const deepBalance = await getBalance('DEEP');
      console.log("deepbalance : ", deepBalance)
      const deepTradeAmount = deepBalance.mul(balancePercentage).toFixed(0);//.div(tradePairs);
      
      // Place sell order
      await createOrder('Sell', deepTradeAmount);
      
      // Wait 2 seconds between pairs
      if (i < tradePairs - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const newUsdtBalance = await getBalance('USDT');
    console.log("New USDT balance is : ", newUsdtBalance)
    if(usdtBalance.equals(newUsdtBalance))
      throw new Error("BALANCE UNCHANGED!")


    console.log('\nAll trading pairs executed successfully');
  } catch (error) {
    console.error('Error executing trading pairs:', error.message);
  }
}

// Start the trading bot
console.log('Starting Bybit Trading Bot...');
executeTradingPairs();