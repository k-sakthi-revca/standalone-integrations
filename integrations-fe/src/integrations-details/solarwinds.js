// SolarWinds integration configuration
const solarwinds = {
  name: "Solarwinds",
  baseUrl: "http://localhost:5000/api/solarwinds", // Using our backend server
  auth: {
    type: "apiKey",
    keyName: "Authorization",
  },
  additionalConfig: {
    baseUri: {
      name: "Base URI",
      description: "Base URI (e.g., https://api.ap-01.cloud.solarwinds.com/v1)",
      required: true
    }
  },
  headers: {
    "Accept": "application/json"
  },
  endpoints: [
    {
      id: "getAlerts",
      name: "Get Alerts",
      method: "GET",
      path: "/alerts",
      description: "Retrieve all active alerts",
      parameters: []
    },
    {
      id: "getMetrics",
      name: "Get Metrics",
      method: "GET",
      path: "/metrics",
      description: "Retrieve available metrics",
      parameters: [
        {
          name: "metricName",
          type: "text",
          required: false,
          description: "Optional metric name to filter results"
        },
        {
          name: "from",
          type: "text",
          required: false,
          description: "Start time (ISO 8601 format) for metrics range"
        },
        {
          name: "to",
          type: "text",
          required: false,
          description: "End time (ISO 8601 format) for metrics range"
        }
      ]
    }
  ]
};

export default solarwinds;
