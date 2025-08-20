import React, { createContext, useState } from 'react';

export const BoxContext = createContext();

export const BoxProvider = ({ children, token, onRefresh }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const moveFile = async (fileId, newParentId, oldParentId) => {
    if (!fileId || !newParentId) {
      setError('Missing required parameters for moving file');
      return;
    }
    
    // If oldParentId is not provided, use "0" as default (Box root folder)
    const sourceParentId = oldParentId || "0";

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/box/move-file?token=${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId,
          newParentId,
          oldParentId: sourceParentId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to move file');
      }

      // Clear selection and target
      setSelectedNode(null);
      setTargetNode(null);
      
      // Show success message
      setSuccessMessage(`Successfully moved ${selectedNode.name} to ${targetNode.name}`);
      
      // Refresh the tree view
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 1000);
      }
    } catch (err) {
      console.error('Error moving file:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSelections = () => {
    setSelectedNode(null);
    setTargetNode(null);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <BoxContext.Provider
      value={{
        selectedNode,
        setSelectedNode,
        targetNode,
        setTargetNode,
        loading,
        error,
        successMessage,
        moveFile,
        clearSelections
      }}
    >
      {children}
    </BoxContext.Provider>
  );
};
