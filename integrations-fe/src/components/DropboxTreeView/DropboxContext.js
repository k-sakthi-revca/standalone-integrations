import React, { createContext, useState } from 'react';

export const DropboxContext = createContext();

export const DropboxProvider = ({ children, token, onRefresh }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);
  
  // New state for selection mode and selected items
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSelectedTable, setShowSelectedTable] = useState(false);

  const moveFile = async (filePath, newParentPath) => {
    if (!filePath || !newParentPath) {
      setError('Missing required parameters for moving file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/dropbox/move-file?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from_path: filePath,
          to_path: `${newParentPath}/${selectedNode.name}`
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
    setDownloadStatus(null);
  };
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // If turning off selection mode, clear selected items
      setSelectedItems([]);
      setShowSelectedTable(false);
    }
  };
  
  // Toggle item selection
  const toggleItemSelection = (node) => {
    if (!selectionMode) return;
    
    setSelectedItems(prevItems => {
      const isSelected = prevItems.some(item => item.id === node.id);
      if (isSelected) {
        // Remove item if already selected
        return prevItems.filter(item => item.id !== node.id);
      } else {
        // Add item if not selected
        return [...prevItems, node];
      }
    });
  };
  
  // Check if an item is selected
  const isItemSelected = (nodeId) => {
    return selectedItems.some(item => item.id === nodeId);
  };
  
  // Finalize selection and show table
  const finalizeSelection = () => {
    if (selectedItems.length > 0) {
      setShowSelectedTable(true);
    } else {
      setError('Please select at least one file or folder');
    }
  };
  
  // Download all selected items
  const downloadSelectedItems = () => {
    if (selectedItems.length === 0) {
      setError('No items selected for download');
      return;
    }
    
    setDownloadStatus(`Preparing download for ${selectedItems.length} item(s)...`);
    
    // Download each selected item
    selectedItems.forEach((item, index) => {
  setTimeout(() => {
    try {
      const downloadLink = document.createElement('a');

      if (item.type === 'folder') {
        downloadLink.href = `http://localhost:5000/api/dropbox/download-folder?token=${token}&path=${encodeURIComponent(item.id)}`;
        downloadLink.download = `${item.name}.zip`;
      } else {
        downloadLink.href = `http://localhost:5000/api/dropbox/download-file?token=${token}&path=${encodeURIComponent(item.id)}`;
        downloadLink.download = item.name;
      }

      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err);
    }
  }, index * 1000); // wait 1 second between downloads
});

    
    setDownloadStatus(`Download started for ${selectedItems.length} item(s)`);
    
    // Clear the status after a few seconds
    setTimeout(() => {
      setDownloadStatus(null);
    }, 3000);
  };
  
  // Clear selected items and hide table
  const clearSelectedItems = () => {
    setSelectedItems([]);
    setShowSelectedTable(false);
  };

  const downloadFile = (node) => {
    if (!node || !token) {
      setError('Missing required parameters for downloading file');
      return;
    }

    setDownloadStatus(`Preparing download for ${node.name}...`);

    try {
      // Create a hidden anchor element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = `http://localhost:5000/api/dropbox/download-file?token=${token}&path=${encodeURIComponent(node.id)}`;
      downloadLink.target = '_blank';
      downloadLink.download = node.name;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setDownloadStatus(`Download started for ${node.name}`);
      
      // Clear the status after a few seconds
      setTimeout(() => {
        setDownloadStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(err.message);
      setDownloadStatus(null);
    }
  };

  const downloadFolder = (node) => {
    if (!node || !token) {
      setError('Missing required parameters for downloading folder');
      return;
    }

    setDownloadStatus(`Preparing download for ${node.name} (this may take a while for large folders)...`);

    try {
      // Create a hidden anchor element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = `http://localhost:5000/api/dropbox/download-folder?token=${token}&path=${encodeURIComponent(node.id)}`;
      downloadLink.target = '_blank';
      downloadLink.download = `${node.name}.zip`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setDownloadStatus(`Download started for ${node.name}.zip`);
      
      // Clear the status after a few seconds
      setTimeout(() => {
        setDownloadStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error downloading folder:', err);
      setError(err.message);
      setDownloadStatus(null);
    }
  };

  return (
    <DropboxContext.Provider
      value={{
        selectedNode,
        setSelectedNode,
        targetNode,
        setTargetNode,
        loading,
        error,
        successMessage,
        downloadStatus,
        moveFile,
        clearSelections,
        downloadFile,
        downloadFolder,
        // New selection mode values
        selectionMode,
        toggleSelectionMode,
        selectedItems,
        toggleItemSelection,
        isItemSelected,
        finalizeSelection,
        showSelectedTable,
        downloadSelectedItems,
        clearSelectedItems
      }}
    >
      {children}
    </DropboxContext.Provider>
  );
};
