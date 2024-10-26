# Bybit Trading Bot

A simple automated trading bot for Bybit DEEP/USDT spot pairs.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Bybit API credentials:
   - BYBIT_API_KEY: Your Bybit API key
   - BYBIT_API_SECRET: Your Bybit API secret
   - TRADE_PAIRS: Number of buy/sell pairs to execute
   - BALANCE_PERCENTAGE: Percentage of balance to use per trade

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the bot:
   ```bash
   npm start
   ```

## Features

- Automated DEEP/USDT spot trading on Bybit
- Configurable number of trading pairs
- Configurable percentage of balance to trade
- Market orders for immediate execution