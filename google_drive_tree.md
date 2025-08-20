# Google Drive File/Folder Tree View (React + Node)

This guide explains how to fetch Google Drive files/folders (you already
have OAuth working) and display them in a **tree view** on your main
React screen.

------------------------------------------------------------------------

## 1. Backend -- Fetch files and build tree

**drive.js**

``` js
const { google } = require("googleapis");

async function listAllFiles(oauth2Client) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const files = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: "trashed=false",
      fields: "nextPageToken, files(id, name, mimeType, parents)",
      pageSize: 1000,
      pageToken,
    });
    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

function buildTree(files) {
  const ROOT_ID = "root";
  const root = {
    id: ROOT_ID,
    name: "My Drive",
    mimeType: "application/vnd.google-apps.folder",
    children: [],
  };
  const map = { [ROOT_ID]: root };

  // create nodes
  for (const f of files) {
    map[f.id] = { ...f, children: [] };
  }

  // attach children
  for (const f of files) {
    const parentId = f.parents ? f.parents[0] : ROOT_ID;
    (map[parentId] || root).children.push(map[f.id]);
  }

  return root;
}

module.exports = { listAllFiles, buildTree };
```

**API route**

``` js
app.get("/drive/tree", async (req, res) => {
  const files = await listAllFiles(req.user.oauthClient);
  const tree = buildTree(files);
  res.json(tree);
});
```

------------------------------------------------------------------------

## 2. Frontend -- API helper

**src/api.js**

``` js
import axios from "axios";
export const getDriveTree = () => axios.get("/drive/tree").then(r => r.data);
```

------------------------------------------------------------------------

## 3. Frontend -- Tree components

**src/TreeNode.jsx**

``` jsx
import { useState } from "react";

const isFolder = (node) => node.mimeType === "application/vnd.google-apps.folder";

export default function TreeNode({ node }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginLeft: 16 }}>
      <div
        style={{ cursor: isFolder(node) ? "pointer" : "default" }}
        onClick={() => isFolder(node) && setOpen(!open)}
      >
        {isFolder(node) ? (open ? "📂" : "📁") : "📄"} {node.name}
      </div>
      {open && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**src/DriveTree.jsx**

``` jsx
import { useEffect, useState } from "react";
import { getDriveTree } from "./api";
import TreeNode from "./TreeNode";

export default function DriveTree() {
  const [tree, setTree] = useState(null);

  useEffect(() => {
    getDriveTree().then(setTree).catch(console.error);
  }, []);

  if (!tree) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Google Drive Explorer</h2>
      <TreeNode node={tree} />
    </div>
  );
}
```

**src/App.js**

``` jsx
import DriveTree from "./DriveTree";

export default function App() {
  return <DriveTree />;
}
```

------------------------------------------------------------------------

## 4. Result

-   Fetches all Drive files/folders via backend API.
-   Builds a tree structure.
-   Renders it recursively in React.
-   Folders are collapsible with 📁/📂 icons.
-   Files show 📄.
