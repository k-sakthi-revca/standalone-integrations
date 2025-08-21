import React, { useState, useEffect, useContext } from 'react';
import TreeNode from './TreeNode';
import { EgnyteProvider, EgnyteContext } from './EgnyteContext';
import './EgnyteTreeView.css';

// Inner component that uses the context
const EgnyteTreeContent = ({ token, subdomain }) => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedNode, targetNode, loading: moveLoading, error: moveError, successMessage, clearSelections } = useContext(EgnyteContext);

  const fetchEgnyteTree = async () => {
    if (!token || !subdomain) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/egnyte/egnyte-tree?token=${token}&subdomain=${subdomain}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching Egnyte tree: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTree(data);
    } catch (err) {
      console.error('Failed to fetch Egnyte tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEgnyteTree();
  }, [token, subdomain]);

  if (loading) {
    return <div className="egnyte-tree-loading">Loading Egnyte files...</div>;
  }

  if (error) {
    return <div className="egnyte-tree-error">Error: {error}</div>;
  }

  if (!tree) {
    return <div className="egnyte-tree-empty">No files found in Egnyte.</div>;
  }

  return (
    <div className="egnyte-tree-container">
      <h2>Egnyte Explorer</h2>
      
      {/* Status and action bar */}
      <div className="egnyte-tree-status">
        {moveLoading && <div className="egnyte-tree-loading-status">Moving file...</div>}
        {moveError && <div className="egnyte-tree-error-status">Error: {moveError}</div>}
        {successMessage && <div className="egnyte-tree-success-status">{successMessage}</div>}
        
        {selectedNode && (
          <div className="egnyte-tree-selection">
            <strong>Selected:</strong> {selectedNode.name} 
            {selectedNode.type === "folder" ? " (Folder)" : " (File)"}
          </div>
        )}
        
        {targetNode && (
          <div className="egnyte-tree-target">
            <strong>Target:</strong> {targetNode.name}
          </div>
        )}
        
        {(selectedNode || targetNode) && (
          <button 
            className="egnyte-tree-clear-btn"
            onClick={clearSelections}
          >
            Clear Selections
          </button>
        )}
      </div>
      
      <div className="egnyte-tree-instructions">
        <p>To move a file or folder:</p>
        <ol>
          <li>Click "Select" on the item you want to move</li>
          <li>Click "Target" on a folder where you want to move it</li>
          <li>Click "Move" to complete the operation</li>
        </ol>
      </div>
      
      <div className="egnyte-tree">
        <TreeNode node={tree} />
      </div>
    </div>
  );
};

// Wrapper component that provides the context
const EgnyteTreeView = ({ token, subdomain }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    // Increment refresh key to trigger a re-render and data refresh
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <EgnyteProvider token={token} subdomain={subdomain} onRefresh={handleRefresh}>
      <EgnyteTreeContent key={refreshKey} token={token} subdomain={subdomain} />
    </EgnyteProvider>
  );
};

export default EgnyteTreeView;
