// Path: src/components/OutputArea.jsx

import React from 'react';

const OutputArea = ({ output }) => {
  return (
    <div>
      <h3>Output:</h3>
      <pre>{output}</pre>
    </div>
  );
};

export default OutputArea;
