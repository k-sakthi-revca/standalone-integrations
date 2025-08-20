import React, { useState, useEffect, useContext } from 'react';
import TreeNode from './TreeNode';
import { DriveProvider, DriveContext } from './DriveContext';
import './DriveTreeView.css';

// Inner component that uses the context
const DriveTreeContent = ({ token }) => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedNode, targetNode, loading: moveLoading, error: moveError, successMessage, clearSelections } = useContext(DriveContext);

  const fetchDriveTree = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/gdrive/drive-tree?token=${token}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching drive tree: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTree(data);
    } catch (err) {
      console.error('Failed to fetch drive tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveTree();
  }, [token]);

  if (loading) {
    return <div className="drive-tree-loading">Loading Google Drive files...</div>;
  }

  if (error) {
    return <div className="drive-tree-error">Error: {error}</div>;
  }

  if (!tree) {
    return <div className="drive-tree-empty">No files found in Google Drive.</div>;
  }

  return (
    <div className="drive-tree-container">
      <h2>Google Drive Explorer</h2>
      
      {/* Status and action bar */}
      <div className="drive-tree-status">
        {moveLoading && <div className="drive-tree-loading-status">Moving file...</div>}
        {moveError && <div className="drive-tree-error-status">Error: {moveError}</div>}
        {successMessage && <div className="drive-tree-success-status">{successMessage}</div>}
        
        {selectedNode && (
          <div className="drive-tree-selection">
            <strong>Selected:</strong> {selectedNode.name} 
            {selectedNode.mimeType === "application/vnd.google-apps.folder" ? " (Folder)" : " (File)"}
          </div>
        )}
        
        {targetNode && (
          <div className="drive-tree-target">
            <strong>Target:</strong> {targetNode.name}
          </div>
        )}
        
        {(selectedNode || targetNode) && (
          <button 
            className="drive-tree-clear-btn"
            onClick={clearSelections}
          >
            Clear Selections
          </button>
        )}
      </div>
      
      <div className="drive-tree-instructions">
        <p>To move a file or folder:</p>
        <ol>
          <li>Click "Select" on the item you want to move</li>
          <li>Click "Target" on a folder where you want to move it</li>
          <li>Click "Move" to complete the operation</li>
        </ol>
      </div>
      
      <div className="drive-tree">
        <TreeNode node={tree} />
      </div>
    </div>
  );
};

// Wrapper component that provides the context
const DriveTreeView = ({ token }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    // Increment refresh key to trigger a re-render and data refresh
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <DriveProvider token={token} onRefresh={handleRefresh}>
      <DriveTreeContent key={refreshKey} token={token} />
    </DriveProvider>
  );
};

export default DriveTreeView;
