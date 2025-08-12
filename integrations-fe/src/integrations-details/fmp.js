// FMP integration configuration
const fmp = {
  name: "Fmp",
  baseUrl: "http://localhost:5000/api/fmp", // Main API base URL
    auth: {
    type: "apiKey",
    keyName: "Authorization",
    valuePrefix: "Token ",
  },
  headers: {
    "Accept": "application/json"
  },
  endpoints: [
    {
      id: "getCompanyProfile",
      name: "Get Company Profile",
      method: "GET",
      path: "/company-profile/{symbol}",
      description: "Retrieve company profile information such as name, industry, and description.",
      parameters: [
        {
          name: "symbol",
          type: "text",
          required: true,
          description: "Stock symbol (e.g., AAPL, MSFT)"
        }
      ]
    },
    {
      id: "getStockQuote",
      name: "Get Stock Quote",
      method: "GET",
      path: "/stock-quote/{symbol}",
      description: "Retrieve real-time stock quote data including latest price and percentage change.",
      parameters: [
        {
          name: "symbol",
          type: "text",
          required: true,
          description: "Stock symbol (e.g., AAPL, TSLA)"
        }
      ]
    },
    {
      id: "getIncomeStatement",
      name: "Get Income Statement",
      method: "GET",
      path: "/income-statement/{symbol}",
      description: "Retrieve income statement data for the given company.",
      parameters: [
        {
          name: "symbol",
          type: "text",
          required: true,
          description: "Stock symbol (e.g., AAPL, GOOGL)"
        },
        {
          name: "limit",
          type: "number",
          required: false,
          default: 5,
          description: "Number of results to return (e.g., last 5 periods)"
        }
      ]
    },
    {
      id: "getHistoricalPrice",
      name: "Get Historical Price Data",
      method: "GET",
      path: "/historical-price/{symbol}",
      description: "Retrieve historical stock prices for the given symbol.",
      parameters: [
        {
          name: "symbol",
          type: "text",
          required: true,
          description: "Stock symbol (e.g., AAPL, AMZN)"
        },
        {
          name: "serietype",
          type: "text",
          required: false,
          default: "line",
          description: "Type of series data (e.g., line, candles)"
        }
      ]
    },
    {
      id: "searchCompanies",
      name: "Search Companies",
      method: "GET",
      path: "/search-companies",
      description: "Search for companies by name or symbol.",
      parameters: [
        {
          name: "query",
          type: "text",
          required: true,
          description: "Search term (e.g., apple, tesla)"
        },
        {
          name: "limit",
          type: "number",
          required: false,
          default: 10,
          description: "Number of search results to return"
        },
        {
          name: "exchange",
          type: "text",
          required: false,
          description: "Exchange code (e.g., NASDAQ, NYSE)"
        }
      ]
    }
  ]
};

export default fmp;
