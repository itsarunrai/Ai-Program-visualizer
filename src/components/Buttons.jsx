import React from 'react';

const Buttons = ({ setLanguage, handleRunClick, handleVisualizeClick, handleExplainCodeClick }) => {
  return (
    <div className="buttons-container">
      <button onClick={() => setLanguage('javascript')}>JavaScript</button>
      <button onClick={() => setLanguage('python')}>Python</button>
      <button className="run-button" onClick={handleRunClick}>Run Code</button>
      <button className="visualize-button" onClick={handleVisualizeClick}>Visualize Code</button>
      <button className="explain-button" onClick={handleExplainCodeClick}>Static Code</button> {/* New button */}
    </div>
  );
};

export default Buttons;
