import React, { useState, useEffect, useContext } from 'react';
import TreeNode from './TreeNode';
import { BoxProvider, BoxContext } from './BoxContext';
import './BoxTreeView.css';

// Inner component that uses the context
const BoxTreeContent = ({ token }) => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedNode, targetNode, loading: moveLoading, error: moveError, successMessage, clearSelections } = useContext(BoxContext);

  const fetchBoxTree = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/box/box-tree?token=${token}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching Box tree: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTree(data);
    } catch (err) {
      console.error('Failed to fetch Box tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxTree();
  }, [token]);

  if (loading) {
    return <div className="box-tree-loading">Loading Box files...</div>;
  }

  if (error) {
    return <div className="box-tree-error">Error: {error}</div>;
  }

  if (!tree) {
    return <div className="box-tree-empty">No files found in Box.</div>;
  }

  return (
    <div className="box-tree-container">
      <h2>Box Explorer</h2>
      
      {/* Status and action bar */}
      <div className="box-tree-status">
        {moveLoading && <div className="box-tree-loading-status">Moving file...</div>}
        {moveError && <div className="box-tree-error-status">Error: {moveError}</div>}
        {successMessage && <div className="box-tree-success-status">{successMessage}</div>}
        
        {selectedNode && (
          <div className="box-tree-selection">
            <strong>Selected:</strong> {selectedNode.name} 
            {selectedNode.type === "folder" ? " (Folder)" : " (File)"}
          </div>
        )}
        
        {targetNode && (
          <div className="box-tree-target">
            <strong>Target:</strong> {targetNode.name}
          </div>
        )}
        
        {(selectedNode || targetNode) && (
          <button 
            className="box-tree-clear-btn"
            onClick={clearSelections}
          >
            Clear Selections
          </button>
        )}
      </div>
      
      <div className="box-tree-instructions">
        <p>To move a file or folder:</p>
        <ol>
          <li>Click "Select" on the item you want to move</li>
          <li>Click "Target" on a folder where you want to move it</li>
          <li>Click "Move" to complete the operation</li>
        </ol>
      </div>
      
      <div className="box-tree">
        <TreeNode node={tree} />
      </div>
    </div>
  );
};

// Wrapper component that provides the context
const BoxTreeView = ({ token }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    // Increment refresh key to trigger a re-render and data refresh
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <BoxProvider token={token} onRefresh={handleRefresh}>
      <BoxTreeContent key={refreshKey} token={token} />
    </BoxProvider>
  );
};

export default BoxTreeView;
