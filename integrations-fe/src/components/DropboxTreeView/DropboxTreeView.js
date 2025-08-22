import React, { useState, useEffect, useContext } from 'react';
import TreeNode from './TreeNode';
import { DropboxProvider, DropboxContext } from './DropboxContext';
import './DropboxTreeView.css';

// Inner component that uses the context
const DropboxTreeContent = ({ token }) => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    selectedNode, 
    targetNode, 
    loading: moveLoading, 
    error: moveError, 
    successMessage, 
    downloadStatus,
    clearSelections,
    // New selection mode props
    selectionMode,
    toggleSelectionMode,
    selectedItems,
    finalizeSelection,
    showSelectedTable,
    downloadSelectedItems,
    clearSelectedItems
  } = useContext(DropboxContext);

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
      
      {/* Selected files table */}
      {showSelectedTable && (
        <div className="dropbox-selected-table">
          <h3>Selected Files</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Path</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.type === 'folder' ? 'Folder' : 'File'}</td>
                  <td>{item.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="dropbox-selected-actions">
            <button 
              className="dropbox-download-selected-btn"
              onClick={downloadSelectedItems}
            >
              Download Selected Items
            </button>
            <button 
              className="dropbox-clear-selected-btn"
              onClick={clearSelectedItems}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Selection mode controls */}
      <div className="dropbox-selection-controls">
        <button 
          className={`dropbox-selection-mode-btn ${selectionMode ? 'active' : ''}`}
          onClick={toggleSelectionMode}
        >
          {selectionMode ? 'Exit Selection Mode' : 'Select Items'}
        </button>
        
        {selectionMode && selectedItems.length > 0 && (
          <button 
            className="dropbox-finalize-btn"
            onClick={finalizeSelection}
          >
            Finalize Selection ({selectedItems.length} items)
          </button>
        )}
      </div>
      
      {/* Status and action bar */}
      <div className="dropbox-tree-status">
        {moveLoading && <div className="dropbox-tree-loading-status">Moving file...</div>}
        {moveError && <div className="dropbox-tree-error-status">Error: {moveError}</div>}
        {successMessage && <div className="dropbox-tree-success-status">{successMessage}</div>}
        {downloadStatus && <div className="dropbox-tree-download-status">{downloadStatus}</div>}
        
        {!selectionMode && (
          <>
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
          </>
        )}
      </div>
      
      <div className="dropbox-tree-instructions">
        {selectionMode ? (
          <p>
            <strong>Selection Mode:</strong> Check the boxes next to files and folders you want to download, 
            then click "Finalize Selection" to proceed.
          </p>
        ) : (
          <>
            <p>Available operations:</p>
            <ul>
              <li><strong>Select Items:</strong> Click "Select Items" to enable multi-selection mode for downloading files and folders</li>
              <li><strong>Move:</strong> Click "Select" on an item, "Target" on a destination folder, then "Move" to relocate it</li>
            </ul>
          </>
        )}
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
