// Cisco DNA (Cisco Catalyst Center) integration configuration
const ciscoDna = {
  name: "Cisco DNA (Cisco Catalyst Center)",
  baseUrl: "http://localhost:5000/api/cisco-dna",
  auth: {
    type: "basic",
    keyName: "Authorization"
  },
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  // Additional configuration for Cisco DNA
  additionalConfig: {
    baseUrl: {
      name: "Base URL",
      description: "Cisco DNA Center URL (e.g., https://sandboxdnac.cisco.com)",
      required: true
    }
  },
  endpoints: [
    {
      id: "getNetworkDevices",
      name: "Get Network Devices",
      method: "GET",
      path: "/dna/network-devices",
      description: "Retrieve network devices from Cisco DNA Center",
      parameters: []
    }
  ]
};

export default ciscoDna;
