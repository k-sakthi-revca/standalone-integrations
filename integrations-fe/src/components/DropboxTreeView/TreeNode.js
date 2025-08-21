import React, { useState, useContext } from 'react';
import { DropboxContext } from './DropboxContext';

const isFolder = (node) => node.type === "folder";

const TreeNode = ({ node }) => {
  const [open, setOpen] = useState(false);
  const { 
    selectedNode, 
    setSelectedNode, 
    targetNode, 
    setTargetNode, 
    moveFile 
  } = useContext(DropboxContext);

  const isSelected = selectedNode && selectedNode.id === node.id;
  const isTarget = targetNode && targetNode.id === node.id;

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
    while (parent && parent.parent && parent.parent.id) {
      parentIds.add(parent.parent.id);
      parent = parent.parent;
    }
    
    if (selectedNode && parentIds.has(selectedNode.id)) return; // Can't move to a child
    
    setTargetNode(node);
  };

  const handleMove = (e) => {
    e.stopPropagation();
    if (selectedNode && targetNode) {
      moveFile(selectedNode.id, targetNode.id);
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
          backgroundColor: isSelected ? '#e3f2fd' : isTarget ? '#e8f5e9' : 'transparent',
          borderRadius: '4px'
        }}
        onClick={handleToggleFolder}
      >
        <span style={{ marginRight: 8 }}>
          {isFolder(node) ? (open ? "📂" : "📁") : "📄"}
        </span>
        <span style={{ flexGrow: 1 }}>{node.name}</span>
        
        <div style={{ display: 'flex', marginLeft: 'auto' }}>
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
