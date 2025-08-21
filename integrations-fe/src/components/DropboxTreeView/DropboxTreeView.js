import React, { useState, useEffect, useContext } from 'react';
import TreeNode from './TreeNode';
import { DropboxProvider, DropboxContext } from './DropboxContext';
import './DropboxTreeView.css';

// Inner component that uses the context
const DropboxTreeContent = ({ token }) => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedNode, targetNode, loading: moveLoading, error: moveError, successMessage, clearSelections } = useContext(DropboxContext);

  const fetchDropboxTree = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/dropbox/dropbox-tree?token=${token}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching Dropbox tree: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTree(data);
    } catch (err) {
      console.error('Failed to fetch Dropbox tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropboxTree();
  }, [token]);

  if (loading) {
    return <div className="dropbox-tree-loading">Loading Dropbox files...</div>;
  }

  if (error) {
    return <div className="dropbox-tree-error">Error: {error}</div>;
  }

  if (!tree) {
    return <div className="dropbox-tree-empty">No files found in Dropbox.</div>;
  }

  return (
    <div className="dropbox-tree-container">
      <h2>Dropbox Explorer</h2>
      
      {/* Status and action bar */}
      <div className="dropbox-tree-status">
        {moveLoading && <div className="dropbox-tree-loading-status">Moving file...</div>}
        {moveError && <div className="dropbox-tree-error-status">Error: {moveError}</div>}
        {successMessage && <div className="dropbox-tree-success-status">{successMessage}</div>}
        
        {selectedNode && (
          <div className="dropbox-tree-selection">
            <strong>Selected:</strong> {selectedNode.name} 
            {selectedNode.type === "folder" ? " (Folder)" : " (File)"}
          </div>
        )}
        
        {targetNode && (
          <div className="dropbox-tree-target">
            <strong>Target:</strong> {targetNode.name}
          </div>
        )}
        
        {(selectedNode || targetNode) && (
          <button 
            className="dropbox-tree-clear-btn"
            onClick={clearSelections}
          >
            Clear Selections
          </button>
        )}
      </div>
      
      <div className="dropbox-tree-instructions">
        <p>To move a file or folder:</p>
        <ol>
          <li>Click "Select" on the item you want to move</li>
          <li>Click "Target" on a folder where you want to move it</li>
          <li>Click "Move" to complete the operation</li>
        </ol>
      </div>
      
      <div className="dropbox-tree">
        <TreeNode node={tree} />
      </div>
    </div>
  );
};

// Wrapper component that provides the context
const DropboxTreeView = ({ token }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    // Increment refresh key to trigger a re-render and data refresh
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <DropboxProvider token={token} onRefresh={handleRefresh}>
      <DropboxTreeContent key={refreshKey} token={token} />
    </DropboxProvider>
  );
};

export default DropboxTreeView;
