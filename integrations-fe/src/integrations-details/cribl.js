// Cribl integration configuration
const cribl = {
    name: "Cribl",
    baseUrl: "http://localhost:5000/api/cribl",
    auth: {
        type: "apiKey",
        keyName: "Authorization",
        valuePrefix: "Bearer ",
    },
    headers: {
        "Accept": "application/json"
    },
    // Additional configuration for Cribl
    additionalConfig: {
        clientId: {
            name: "Client ID",
            description: "Cribl API Client ID",
            required: true
        },
        clientSecret: {
            name: "Client Secret",
            description: "Cribl API Client Secret",
            required: true
        },
        baseUrl: {
            name: "Base URL",
            description: "Cribl Base URL (e.g., https://your-instance.cribl.cloud)",
            required: true
        }
    },
    endpoints: [
        {
            id: "getAllWorkers",
            name: "Get All Workers",
            method: "GET",
            path: "/workers",
            description: "Retrieve all workers",
            parameters: []
        },
        {
            id: "getWorker",
            name: "Get a worker",
            method: "GET",
            path: "/worker/{guid}",
            description: "Retrieve a worker with its GUID",
                        parameters: [
                {
                    name: "guid",
                    type: "text",
                    required: true,
                    description: "Worker's GUID"
                }
            ]
        },
    ]
};

export default cribl;
