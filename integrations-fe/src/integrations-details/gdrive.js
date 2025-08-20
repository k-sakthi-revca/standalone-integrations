// Salesforce integration configuration
const gdrive = {
    name: "Google Drive",
    baseUrl: "http://localhost:5000/api/gdrive",
    auth: {
        type: "oauth",
        keyName: "Authorization"
    },
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
    endpoints: [
        {
            id: "getAll",
            name: "Get All files and folders",
            method: "GET",
            path: "/get-all-files-and-folders",
            description: "Retrieve All files and folders",
            parameters: []
        }
    ]
};

export default gdrive;
