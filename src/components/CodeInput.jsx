import React from 'react';

const CodeInput = ({ code, setCode, language }) => {
  return (
    <textarea
      value={code}
      onChange={(e) => setCode(e.target.value)}
      placeholder={`Write ${language} code here...`}
      rows="10"
      cols="50"
    />
  );
};

export default CodeInput;
