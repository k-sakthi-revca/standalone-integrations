// Cisco Meraki integration configuration
const meraki = {
  name: "Cisco Meraki",
  baseUrl: "http://localhost:5000/api/meraki",
  auth: {
    type: "apiKey",
    keyName: "X-Cisco-Meraki-API-Key",
  },
  headers: {
    "Accept": "application/json"
  },
  // Additional configuration for Meraki
  additionalConfig: {
    baseUri: {
      name: "Base URI",
      description: "Base URI (e.g., https://api.meraki.ca/api/v1, https://api.meraki.in/api/v1)",
      required: true
    }
  },
  endpoints: [
    {
      id: "getOrganizations",
      name: "Get All Organizations",
      method: "GET",
      path: "/organizations",
      description: "Retrieve all organizations",
      parameters: []
    },
    {
      id: "getOrganization",
      name: "Get Organization",
      method: "GET",
      path: "/organizations/{organizationId}",
      description: "Retrieve a specific organization",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getOrganizationDevices",
      name: "Get Organization Devices",
      method: "GET",
      path: "/organizations/{organizationId}/devices",
      description: "Retrieve devices in a specific organization",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getDevice",
      name: "Get Device",
      method: "GET",
      path: "/devices/{serial}",
      description: "Retrieve a specific device by serial number",
      parameters: [
        {
          name: "serial",
          type: "text",
          required: true,
          description: "Device Serial Number"
        }
      ]
    },
    {
      id: "getOrganizationNetworks",
      name: "Get Organization Networks",
      method: "GET",
      path: "/organizations/{organizationId}/networks",
      description: "Retrieve networks in a specific organization",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getNetwork",
      name: "Get Network",
      method: "GET",
      path: "/networks/{networkId}",
      description: "Retrieve a specific network",
      parameters: [
        {
          name: "networkId",
          type: "text",
          required: true,
          description: "Network ID"
        }
      ]
    },
    {
      id: "getOrganizationActionBatches",
      name: "Get Organization Action Batches",
      method: "GET",
      path: "/organizations/{organizationId}/actionBatches",
      description: "Retrieve action batches for a specific organization",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getOrganizationActionBatch",
      name: "Get Organization Action Batch",
      method: "GET",
      path: "/organizations/{organizationId}/actionBatches/{actionBatchId}",
      description: "Retrieve a specific action batch for an organization",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        },
        {
          name: "actionBatchId",
          type: "text",
          required: true,
          description: "Action Batch ID"
        }
      ]
    },
    {
      id: "getAlertProfiles",
      name: "Get Alert Profiles",
      method: "GET",
      path: "/organizations/{organizationId}/alerts/profiles",
      description: "Retrieve Alert Profiles",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getAlertSettings",
      name: "Get Alert Settings",
      method: "GET",
      path: "/networks/{networkId}/alerts/settings",
      description: "Retrieve Alert Settings",
      parameters: [
        {
          name: "networkId",
          type: "text",
          required: true,
          description: "Network ID"
        }
      ]
    },
    {
      id: "getOrganizationAssuranceAlerts",
      name: "Get Organization Assurance Alerts",
      method: "GET",
      path: "/organizations/{organizationId}/assurance/alerts",
      description: "Retrieve a list of assurance alerts for the organization.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getOrganizationAssuranceAlertsOverview",
      name: "Get Organization Assurance Alerts Overview",
      method: "GET",
      path: "/organizations/{organizationId}/assurance/alerts/overview",
      description: "Retrieve an overview of assurance alerts for the organization.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getAlertProfiles",
      name: "Get Alert Profiles",
      method: "GET",
      path: "/organizations/{organizationId}/alerts/profiles",
      description: "Retrieve Alert Profiles",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getOrganizationAssuranceAlertsOverviewByNetwork",
      name: "Get Organization Assurance Alerts Overview By Network",
      method: "GET",
      path: "/organizations/{organizationId}/assurance/alerts/overview/byNetwork",
      description: "Retrieve an overview of assurance alerts categorized by network.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getOrganizationBrandingPolicies",
      name: "Get Organization Branding Policies",
      method: "GET",
      path: "/organizations/{organizationId}/brandingPolicies",
      description: "Retrieve branding policies for an organization.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getOrganizationBrandingPolicy",
      name: "Get Organization Branding Policy",
      method: "GET",
      path: "/organizations/{organizationId}/brandingPolicies/{brandingPolicyId}",
      description: "Retrieve a specific branding policy by ID.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        },
        {
          name: "brandingPolicyId",
          type: "text",
          required: true,
          description: "Branding Policy ID"
        }
      ]
    },
    {
      id: "getOrganizationBrandingPoliciesPriorities",
      name: "Get Organization Branding Policies Priorities",
      method: "GET",
      path: "/organizations/{organizationId}/brandingPolicies/priorities",
      description: "Retrieve the priority list of branding policies.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getDeviceCellularSims",
      name: "Get Device Cellular Sims",
      method: "GET",
      path: "/devices/{serial}/cellular/sims",
      description: "Retrieve SIM information for a device with cellular connectivity.",
      parameters: [
        {
          name: "serial",
          type: "text",
          required: true,
          description: "Device serial number"
        }
      ]
    },
    {
      id: "getOrganizationClientsSearch",
      name: "Get Organization Clients Search",
      method: "GET",
      path: "/organizations/{organizationId}/clients/search",
      description: "Search for clients across an organization using filters like MAC address or IP.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getNetworkClientPolicy",
      name: "Get Network Client Policy",
      method: "GET",
      path: "/networks/{networkId}/clients/{clientId}/policy",
      description: "Retrieve the policy assigned to a client on a network.",
      parameters: [
        {
          name: "networkId",
          type: "text",
          required: true,
          description: "Network ID"
        },
        {
          name: "clientId",
          type: "text",
          required: true,
          description: "Client ID (usually MAC address)"
        }
      ]
    },
    {
      id: "getOrganizationLicenses",
      name: "Get Organization Licenses",
      method: "GET",
      path: "/organizations/{organizationId}/licenses",
      description: "Retrieve all licenses for the organization.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getOrganizationLicense",
      name: "Get Organization License",
      method: "GET",
      path: "/organizations/{organizationId}/licenses/{licenseId}",
      description: "Retrieve details of a specific license by ID.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        },
        {
          name: "licenseId",
          type: "text",
          required: true,
          description: "License ID"
        }
      ]
    },
    {
      id: "getOrganizationLoginSecurity",
      name: "Get Organization Login Security",
      method: "GET",
      path: "/organizations/{organizationId}/loginSecurity",
      description: "Retrieve login security settings for the organization.",
      parameters: [
        {
          name: "organizationId",
          type: "text",
          required: true,
          description: "Organization ID"
        }
      ]
    },
    {
      id: "getNetworkTrafficAnalysis",
      name: "Get Network Traffic Analysis",
      method: "GET",
      path: "/networks/{networkId}/trafficAnalysis",
      description: "Retrieve traffic analysis settings for a network.",
      parameters: [
        {
          name: "networkId",
          type: "text",
          required: true,
          description: "Network ID"
        }
      ]
    },
    {
      id: "getNetworkSyslogServers",
      name: "Get Network Syslog Servers",
      method: "GET",
      path: "/networks/{networkId}/syslogServers",
      description: "Retrieve syslog server settings for a network.",
      parameters: [
        {
          name: "networkId",
          type: "text",
          required: true,
          description: "Network ID"
        }
      ]
    }
  ]
};

export default meraki;
