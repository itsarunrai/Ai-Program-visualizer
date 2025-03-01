import React from 'react';
import './Popup.css';

const Popup = ({ content, onClose }) => {
  // Function to copy content to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        alert('Content copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy content.');
      });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h2>AI Visualization</h2>
          <div className="popup-header-buttons">
            <button className="copy-button" onClick={handleCopy}>
              Copy
            </button>
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
        <div className="popup-body">
          <pre className="popup-content">{content}</pre>
        </div>
        <div className="popup-footer">
          <button className="close-footer-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
