import config from '../config';
import logger from '../config/logger';

// Define types
type StockPrice = {
  symbol: string;
  price: number;
  timestamp: string;
};

// Mock stock data with realistic prices
const mockStocks: Record<string, number> = {
  AAPL: 175.84,
  GOOGL: 2750.32,
  MSFT: 415.32,
  AMZN: 178.75,
  TSLA: 177.77,
  META: 485.58,
  NVDA: 950.02,
  JPM: 198.95,
  V: 279.96,
  WMT: 59.83,
};

// Validate stock symbol exists
function isValidStockSymbol(symbol: string): boolean {
  return symbol.toUpperCase() in mockStocks;
}

// Simulate price fluctuations
function getRandomFluctuation(): number {
  return (Math.random() - 0.5) * 2; // Random value between -1 and 1
}

function updateMockPrices(): void {
  Object.keys(mockStocks).forEach(symbol => {
    const currentPrice = mockStocks[symbol];
    const fluctuation = getRandomFluctuation();
    const newPrice = currentPrice * (1 + fluctuation * 0.01); // 1% max change
    mockStocks[symbol] = Number(newPrice.toFixed(2));
  });
  logger.debug('Updated mock stock prices', { prices: mockStocks });
}

// Update prices every minute
setInterval(updateMockPrices, 60000);

class StockPriceService {
  async getStockPrice(symbol: string): Promise<StockPrice> {
    try {
      const upperSymbol = symbol.toUpperCase();
      
      if (!isValidStockSymbol(upperSymbol)) {
        throw new Error(`Invalid stock symbol: ${symbol}. Available symbols: ${Object.keys(mockStocks).join(', ')}`);
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const price = mockStocks[upperSymbol];
      logger.debug('Fetched stock price', { symbol: upperSymbol, price });

      return {
        symbol: upperSymbol,
        price,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error fetching stock price', { error, symbol });
      throw error;
    }
  }

  async checkThresholds(): Promise<void> {
    try {
      for (const stock of config.monitoring.stocks) {
        try {
          const { symbol, threshold, condition } = stock;
          const price = await this.getStockPrice(symbol);

          const isAlert = condition === 'above' 
            ? price.price > threshold 
            : price.price < threshold;

          if (isAlert) {
            logger.info('Stock price threshold alert', {
              symbol,
              price: price.price,
              threshold,
              condition,
            });

            // Here you would typically send a notification
            // For now, we'll just log it
            console.log(`ALERT: ${symbol} is ${condition} ${threshold} (Current: ${price.price})`);
          }
        } catch (error) {
          logger.error(`Error checking threshold for ${stock.symbol}`, { error });
          // Continue with other stocks even if one fails
        }
      }
    } catch (error) {
      logger.error('Error checking stock thresholds', { error });
      throw error;
    }
  }

  // Helper method to get all available stock symbols
  getAvailableSymbols(): string[] {
    return Object.keys(mockStocks);
  }
}

export default new StockPriceService(); 