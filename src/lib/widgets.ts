export const cryptoHeatmap = {
  dataSource: "Crypto",
  blockSize: "market_cap_calc",
  blockColor: "change",
  locale: "en",
  symbolUrl: "",
  colorTheme: "dark",
  hasTopBar: false,
  isDataSetEnabled: false,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
};

export const cryptoSymbolOverview = {
  symbols: [
    ["BINANCE:BTCUSDT|1D"],
    ["BINANCE:ETHUSDT|1D"],
    ["BINANCE:SHIBUSDT|1D"],
    ["BINANCE:SOLUSDT|1D"],
    ["BINANCE:DOGEUSDT|1D"],
    ["BINANCE:BNBUSDT|1D"],
    ["BINANCE:LTCUSDT|1D"],
    ["CRYPTO:SHIBUSD|1D"],
    ["BINANCE:OCEANUSDT|1D"],
  ],
  chartOnly: false,
  locale: "en",
  colorTheme: "dark",
  autosize: false,
  showVolume: false,
  showMA: false,
  hideDateRanges: false,
  hideMarketStatus: false,
  hideSymbolLogo: false,
  scalePosition: "right",
  scaleMode: "Normal",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
  fontSize: "10",
  noTimeScale: false,
  valuesTracking: "1",
  changeMode: "price-and-percent",
  chartType: "area",
  maLineColor: "#2962FF",
  maLineWidth: 1,
  maLength: 9,
  lineWidth: 2,
  lineType: 0,
  dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
};

export const cryptoScreener = {
  defaultColumn: "overview",
  screener_type: "crypto_mkt",
  displayCurrency: "USD",
  colorTheme: "dark",
  locale: "en",
};

export const forexChart = {
  autosize: true,
  symbol: "FX:EURUSD",
  interval: "D",
  timezone: "Etc/UTC",
  theme: "dark",
  style: "1",
  locale: "en",
  enable_publishing: false,
  allow_symbol_change: true,
  calendar: false,
  support_host: "https://www.tradingview.com",
};

export const forexCrossRates = {
  currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
  isTransparent: false,
  colorTheme: "dark",
  locale: "en",
};

const quoteGroup = (
  name: string,
  symbols: [name: string, displayName: string][],
) => ({
  name,
  originalName: name,
  symbols: symbols.map(([symbol, displayName]) => ({
    name: symbol,
    displayName,
  })),
});

export const forexMarketQuotes = {
  symbolsGroups: [
    quoteGroup("Indices", [
      ["FOREXCOM:SPXUSD", "S&P 500 Index"],
      ["FOREXCOM:NSXUSD", "US 100 Cash CFD"],
      ["FOREXCOM:DJI", "Dow Jones Industrial Average Index"],
      ["INDEX:NKY", "Nikkei 225"],
      ["INDEX:DEU40", "DAX Index"],
      ["FOREXCOM:UKXGBP", "FTSE 100 Index"],
    ]),
    quoteGroup("Futures", [
      ["CME_MINI:ES1!", "S&P 500"],
      ["CME:6E1!", "Euro"],
      ["COMEX:GC1!", "Gold"],
      ["NYMEX:CL1!", "WTI Crude Oil"],
      ["NYMEX:NG1!", "Gas"],
      ["CBOT:ZC1!", "Corn"],
    ]),
    quoteGroup("Bonds", [
      ["CBOT:ZB1!", "T-Bond"],
      ["CBOT:UB1!", "Ultra T-Bond"],
      ["EUREX:FGBL1!", "Euro Bund"],
      ["EUREX:FBTP1!", "Euro BTP"],
      ["EUREX:FGBM1!", "Euro BOBL"],
    ]),
    quoteGroup("Forex", [
      ["FX:EURUSD", "EUR to USD"],
      ["FX:GBPUSD", "GBP to USD"],
      ["FX:USDJPY", "USD to JPY"],
      ["FX:USDCHF", "USD to CHF"],
      ["FX:AUDUSD", "AUD to USD"],
      ["FX:USDCAD", "USD to CAD"],
    ]),
  ],
  showSymbolLogo: true,
  isTransparent: false,
  colorTheme: "dark",
  locale: "en",
};

export const stockHeatmap = {
  exchanges: [],
  dataSource: "SPX500",
  grouping: "sector",
  blockSize: "market_cap_basic",
  blockColor: "change",
  locale: "en",
  symbolUrl: "",
  colorTheme: "dark",
  hasTopBar: false,
  isDataSetEnabled: false,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
};

export const stockForexHeatmap = {
  currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD", "CNY"],
  isTransparent: false,
  colorTheme: "dark",
  locale: "en",
};

export const stockHotlists = {
  colorTheme: "dark",
  dateRange: "12M",
  exchange: "US",
  showChart: true,
  locale: "en",
  largeChartUrl: "",
  isTransparent: false,
  showSymbolLogo: false,
  showFloatingTooltip: false,
  plotLineColorGrowing: "rgba(41, 98, 255, 1)",
  plotLineColorFalling: "rgba(41, 98, 255, 1)",
  gridLineColor: "rgba(240, 243, 250, 0)",
  scaleFontColor: "rgba(106, 109, 120, 1)",
  belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
  belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
  belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
  belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
  symbolActiveColor: "rgba(41, 98, 255, 0.12)",
};
