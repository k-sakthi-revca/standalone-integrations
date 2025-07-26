// Axonius integration configuration
const axonius = {
  name: "Axonius",
  baseUrl: "http://localhost:5000/api/axonius", // Replace with actual API URL
  auth: {
    type: "apiKey",
    keyName: "api-key",
  },
  endpoints: [
    {
      id: "getDevices",
      name: "Get Devices",
      method: "GET",
      path: "/devices",
      description: "Retrieve a list of devices",
      parameters: [
        {
          name: "limit",
          type: "number",
          required: false,
          default: 10,
          description: "Number of results to return"
        },
        {
          name: "filter",
          type: "text",
          required: false,
          description: "Filter criteria in JSON format"
        }
      ]
    },
    {
      id: "getUsers",
      name: "Get Users",
      method: "GET",
      path: "/users",
      description: "Retrieve a list of users",
      parameters: [
        {
          name: "limit",
          type: "number",
          required: false,
          default: 10,
          description: "Number of results to return"
        }
      ]
    }
  ]
};

export default axonius;
