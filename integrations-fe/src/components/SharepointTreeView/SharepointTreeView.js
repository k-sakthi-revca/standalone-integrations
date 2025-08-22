import React, { useState, useEffect, useContext } from 'react';
import TreeNode from './TreeNode';
import { SharepointProvider, SharepointContext } from './SharepointContext';
import './SharepointTreeView.css';

// Inner component that uses the context
const SharepointTreeContent = ({ token }) => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedNode, targetNode, loading: moveLoading, error: moveError, successMessage, clearSelections } = useContext(SharepointContext);

  const fetchSharepointTree = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/office365/sharepoint-tree?token=${token}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching SharePoint tree: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTree(data);
    } catch (err) {
      console.error('Failed to fetch SharePoint tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharepointTree();
  }, [token]);

  if (loading) {
    return <div className="sharepoint-tree-loading">Loading SharePoint files...</div>;
  }

  if (error) {
    return <div className="sharepoint-tree-error">Error: {error}</div>;
  }

  if (!tree) {
    return <div className="sharepoint-tree-empty">No files found in SharePoint.</div>;
  }

  return (
    <div className="sharepoint-tree-container">
      <h2>OneDrive Explorer</h2>
      
      {/* Status and action bar */}
      <div className="sharepoint-tree-status">
        {moveLoading && <div className="sharepoint-tree-loading-status">Moving file...</div>}
        {moveError && <div className="sharepoint-tree-error-status">Error: {moveError}</div>}
        {successMessage && <div className="sharepoint-tree-success-status">{successMessage}</div>}
        
        {selectedNode && (
          <div className="sharepoint-tree-selection">
            <strong>Selected:</strong> {selectedNode.name} 
            {selectedNode.folder ? " (Folder)" : " (File)"}
          </div>
        )}
        
        {targetNode && (
          <div className="sharepoint-tree-target">
            <strong>Target:</strong> {targetNode.name}
          </div>
        )}
        
        {(selectedNode || targetNode) && (
          <button 
            className="sharepoint-tree-clear-btn"
            onClick={clearSelections}
          >
            Clear Selections
          </button>
        )}
      </div>
      
      <div className="sharepoint-tree-instructions">
        <p>To move a file or folder:</p>
        <ol>
          <li>Click "Select" on the item you want to move</li>
          <li>Click "Target" on a folder where you want to move it</li>
          <li>Click "Move" to complete the operation</li>
        </ol>
      </div>
      
      <div className="sharepoint-tree">
        <TreeNode node={tree} />
      </div>
    </div>
  );
};

// Wrapper component that provides the context
const SharepointTreeView = ({ token }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    // Increment refresh key to trigger a re-render and data refresh
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <SharepointProvider token={token} onRefresh={handleRefresh}>
      <SharepointTreeContent key={refreshKey} token={token} />
    </SharepointProvider>
  );
};

export default SharepointTreeView;
