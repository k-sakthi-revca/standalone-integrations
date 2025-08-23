import React, { useState, useContext } from 'react';
import { SharepointContext } from './SharepointContext';

const isFolder = (node) => node.folder !== undefined;

const TreeNode = ({ node }) => {
  const [open, setOpen] = useState(false);
  const { 
    selectedNode, 
    setSelectedNode, 
    targetNode, 
    setTargetNode, 
    moveFile,
    downloadFile,
    downloadFolder,
    // New selection mode props
    selectionMode,
    toggleItemSelection,
    isItemSelected
  } = useContext(SharepointContext);

  const isSelected = selectedNode && selectedNode.id === node.id;
  const isTarget = targetNode && targetNode.id === node.id;
  
  const handleDownload = (e) => {
    e.stopPropagation();
    if (isFolder(node)) {
      downloadFolder(node);
    } else {
      downloadFile(node);
    }
  };
  
  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    toggleItemSelection(node);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedNode(node);
  };

  const handleSetTarget = (e) => {
    e.stopPropagation();
    if (!isFolder(node)) return; // Only folders can be targets
    if (selectedNode && selectedNode.id === node.id) return; // Can't move to itself
    
    // Check if the selected node is a parent of this node (to prevent circular references)
    let parent = node;
    const parentIds = new Set();
    while (parent && parent.parentReference && parent.parentReference.id) {
      parentIds.add(parent.parentReference.id);
      parent = parent.parent;
    }
    
    if (selectedNode && parentIds.has(selectedNode.id)) return; // Can't move to a child
    
    setTargetNode(node);
  };

  const handleMove = (e) => {
    e.stopPropagation();
    if (selectedNode && targetNode) {
      // Use the parent ID if available
      const oldParentId = selectedNode.parentReference ? selectedNode.parentReference.id : "root";
      
      moveFile(selectedNode.id, targetNode.id, oldParentId);
    }
  };

  const handleToggleFolder = (e) => {
    if (isFolder(node)) {
      setOpen(!open);
    }
  };

  return (
    <div style={{ marginLeft: 16 }}>
      <div
        style={{ 
          cursor: isFolder(node) ? "pointer" : "default",
          display: 'flex',
          alignItems: 'center',
          padding: '4px 0',
          userSelect: 'none',
          backgroundColor: isSelected ? '#e3f2fd' : isTarget ? '#e8f5e9' : isItemSelected(node.id) ? '#f3e5f5' : 'transparent',
          borderRadius: '4px',
          justifyContent: 'flex-start'
        }}
        onClick={handleToggleFolder}
      >
        <div style={{ display: 'flex', alignItems: 'center'}}>
          {selectionMode && (
            <input
              type="checkbox"
              checked={isItemSelected(node.id)}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <span style={{ marginRight: 8, flexShrink: 0 }}>
            {isFolder(node) ? (open ? "📂" : "📁") : "📄"}
          </span>
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {node.name}
          </span>
        </div>
        
        <div style={{ display: 'flex', marginLeft: 'auto' }}>
          {!selectionMode && (
            <>
              <button 
                onClick={handleSelect}
                style={{
                  marginRight: '4px',
                  padding: '2px 6px',
                  backgroundColor: isSelected ? '#2196f3' : '#e0e0e0',
                  color: isSelected ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Select
              </button>
              
              {isFolder(node) && (
                <button 
                  onClick={handleSetTarget}
                  style={{
                    marginRight: '4px',
                    padding: '2px 6px',
                    backgroundColor: isTarget ? '#4caf50' : '#e0e0e0',
                    color: isTarget ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Target
                </button>
              )}
              
              {selectedNode && targetNode && (
                <button 
                  onClick={handleMove}
                  style={{
                    marginRight: '4px',
                    padding: '2px 6px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Move
                </button>
              )}
              
              <button 
                onClick={handleDownload}
                style={{
                  padding: '2px 6px',
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Download
              </button>
            </>
          )}
        </div>
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
};

export default TreeNode;
