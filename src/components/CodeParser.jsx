import React, { useEffect } from 'react';

// Function to create a Data URL from JSON data
const createDataUrl = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

const CodeParser = ({ code, language, setParsedData, onParseComplete }) => {
  useEffect(() => {
    const parseCode = () => {
  const result = {
    language,
    functions: [],
    variables: [],
    loops: [],
    conditions: [],
    classes: [],
    imports: [],
    comments: [],
    arrays: [],
    execution: {
      currentLine: 0,
      currentFunction: null,
      currentLoop: null,
      currentCondition: null,
      currentClass: null,
      callStack: [],
      memoryState: {},
      timing: []
    }
  };

  if (!code) {
    console.warn('No code provided.');
    setParsedData(result);
    return;
  }

  try {
    const updateExecutionState = (stepData) => {
      result.execution.timing.push({
        step: result.execution.timing.length + 1,
        executionTimeMs: Math.random() * 10 // Mock execution time
      });

      if (stepData) {
        result.execution = {
          ...result.execution,
          ...stepData
        };
      }
    };

    if (language === 'javascript') {
      const functionPattern = /function\s+(\w+)\s*\(([^)]*)\)\s*{([\s\S]*?)}/g;
      const variablePattern = /(?:const|let|var)\s+(\w+)/g;
      const forLoopPattern = /for\s*\(([^)]*)\)\s*{([\s\S]*?)}/g;
      const ifPattern = /if\s*\(([^)]*)\)\s*{([\s\S]*?)}/g;
      const classPattern = /class\s+(\w+)\s*{([\s\S]*?)}/g;
      const importPattern = /import\s+(?:\w+\s+from\s+)?['"]([^'"]+)['"]/g;
      const commentPattern = /\/\/(.+)/g;
      const multiLineCommentPattern = /\/\*([\s\S]*?)\*\//g;
      const arrayPattern = /(\w+)\s*=\s*\[(.*?)\]/g;

      // Extract functions
      let match;
      while ((match = functionPattern.exec(code)) !== null) {
        const functionName = match[1];
        result.functions.push({
          name: functionName,
          startLine: code.substr(0, match.index).split('\n').length + 1,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length,
          parameters: (match[2] || '').split(',').map(param => param.trim()),
          body: (match[3] || '').split('\n').map((line, idx) => ({
            type: 'statement',
            content: line.trim(),
            line: (code.substr(0, match.index + match[3].length).split('\n')[idx] || '').trim()
          }))
        });

        updateExecutionState({
          currentFunction: functionName,
          callStack: [...result.execution.callStack, functionName]
        });
      }

      // Extract variables
      while ((match = variablePattern.exec(code)) !== null) {
        const variableName = match[1];
        result.variables.push({
          name: variableName,
          line: code.substr(0, match.index).split('\n').length,
          value: 'undefined'
        });

        result.execution.memoryState[variableName] = 'undefined';
        updateExecutionState();
      }

      // Extract loops
      while ((match = forLoopPattern.exec(code)) !== null) {
        const loopStart = code.substr(0, match.index).split('\n').length + 1;
        const loopEnd = code.substr(0, match.index + match[0].length).split('\n').length;

        result.loops.push({
          type: 'for',
          startLine: loopStart,
          endLine: loopEnd,
          initialization: (match[1] || '').split(';')[0],
          condition: (match[1] || '').split(';')[1],
          increment: (match[1] || '').split(';')[2],
          body: (match[2] || '').split('\n').map((line, idx) => ({
            type: 'statement',
            content: line.trim(),
            line: (code.substr(0, match.index + match[2].length).split('\n')[idx] || '').trim()
          }))
        });

        updateExecutionState({
          currentLoop: `for (${match[1] || ''})`,
          currentLine: loopStart
        });
      }

      // Extract conditions
      while ((match = ifPattern.exec(code)) !== null) {
        const conditionStart = code.substr(0, match.index).split('\n').length + 1;
        const conditionEnd = code.substr(0, match.index + match[0].length).split('\n').length;

        result.conditions.push({
          type: 'if',
          startLine: conditionStart,
          endLine: conditionEnd,
          condition: (match[1] || '').trim(),
          body: (match[2] || '').split('\n').map((line, idx) => ({
            type: 'statement',
            content: line.trim(),
            line: (code.substr(0, match.index + match[2].length).split('\n')[idx] || '').trim()
          }))
        });

        updateExecutionState({
          currentCondition: (match[1] || '').trim(),
          currentLine: conditionStart
        });
      }

      // Extract classes
      while ((match = classPattern.exec(code)) !== null) {
        const className = match[1];
        result.classes.push({
          name: className,
          startLine: code.substr(0, match.index).split('\n').length + 1,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length,
          methods: []
        });

        updateExecutionState({
          currentClass: className
        });
      }

      // Extract arrays
      while ((match = arrayPattern.exec(code)) !== null) {
        const arrayName = match[1];
        result.arrays.push({
          name: arrayName,
          size: (match[2] || '').split(',').length,
          elements: (match[2] || '').split(',').map(element => element.trim()),
          startLine: code.substr(0, match.index).split('\n').length + 1,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length
        });

        result.execution.memoryState[arrayName] = (match[2] || '').split(',').map(element => element.trim());
        updateExecutionState();
      }

      // Extract imports
      while ((match = importPattern.exec(code)) !== null) {
        result.imports.push({
          module: match[1],
          line: code.substr(0, match.index).split('\n').length
        });
      }

      // Extract comments
      while ((match = commentPattern.exec(code)) !== null) {
        result.comments.push({
          type: 'singleLine',
          content: (match[1] || '').trim(),
          line: code.substr(0, match.index).split('\n').length
        });
      }
      while ((match = multiLineCommentPattern.exec(code)) !== null) {
        result.comments.push({
          type: 'multiLine',
          content: (match[1] || '').trim(),
          startLine: code.substr(0, match.index).split('\n').length,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length
        });
      }

    } else if (language === 'python') {
      const functionPattern = /def\s+(\w+)\s*\(([^)]*)\)\s*:\s*([\s\S]*?)(?=\ndef|\Z)/g;
      const variablePattern = /(\w+)\s*=\s*/g;
      const forLoopPattern = /for\s+(\w+)\s+in\s+([\s\S]*?)\s*:\s*([\s\S]*?)(?=\n\w|\Z)/g;
      const ifPattern = /if\s+([\s\S]*?)\s*:\s*([\s\S]*?)(?=\n\w|\Z)/g;
      const classPattern = /class\s+(\w+)\s*:\s*([\s\S]*?)(?=\n\w|\Z)/g;
      const importPattern = /import\s+(\w+)/g;
      const commentPattern = /#(.+)/g;
      const multiLineCommentPattern = /"""\s*([\s\S]*?)\s*"""/g;
      const arrayPattern = /(\w+)\s*=\s*\[(.*?)\]/g;

      // Extract functions
      let match;
      while ((match = functionPattern.exec(code)) !== null) {
        result.functions.push({
          name: match[1],
          startLine: code.substr(0, match.index).split('\n').length + 1,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length,
          parameters: (match[2] || '').split(',').map(param => param.trim()),
          body: (match[3] || '').split('\n').map(line => line.trim())
        });

        updateExecutionState({
          currentFunction: match[1],
          callStack: [...result.execution.callStack, match[1]]
        });
      }

      // Extract variables
      while ((match = variablePattern.exec(code)) !== null) {
        const variableName = match[1];
        result.variables.push({
          name: variableName,
          line: code.substr(0, match.index).split('\n').length,
          value: 'undefined'
        });

        result.execution.memoryState[variableName] = 'undefined';
        updateExecutionState();
      }

      // Extract loops
      while ((match = forLoopPattern.exec(code)) !== null) {
        const loopStart = code.substr(0, match.index).split('\n').length + 1;
        const loopEnd = code.substr(0, match.index + match[0].length).split('\n').length;

        result.loops.push({
          type: 'for',
          startLine: loopStart,
          endLine: loopEnd,
          variable: match[1],
          iterable: match[2],
          body: (match[3] || '').split('\n').map(line => line.trim())
        });

        updateExecutionState({
          currentLoop: `for ${match[1]} in ${match[2]}`,
          currentLine: loopStart
        });
      }

      // Extract conditions
      while ((match = ifPattern.exec(code)) !== null) {
        const conditionStart = code.substr(0, match.index).split('\n').length + 1;
        const conditionEnd = code.substr(0, match.index + match[0].length).split('\n').length;

        result.conditions.push({
          type: 'if',
          startLine: conditionStart,
          endLine: conditionEnd,
          condition: (match[1] || '').trim(),
          body: (match[2] || '').split('\n').map(line => line.trim())
        });

        updateExecutionState({
          currentCondition: (match[1] || '').trim(),
          currentLine: conditionStart
        });
      }

      // Extract classes
      while ((match = classPattern.exec(code)) !== null) {
        const className = match[1];
        result.classes.push({
          name: className,
          startLine: code.substr(0, match.index).split('\n').length + 1,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length,
          methods: []
        });

        updateExecutionState({
          currentClass: className
        });
      }

      // Extract arrays
      while ((match = arrayPattern.exec(code)) !== null) {
        const arrayName = match[1];
        result.arrays.push({
          name: arrayName,
          size: (match[2] || '').split(',').length,
          elements: (match[2] || '').split(',').map(element => element.trim()),
          startLine: code.substr(0, match.index).split('\n').length + 1,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length
        });

        result.execution.memoryState[arrayName] = (match[2] || '').split(',').map(element => element.trim());
        updateExecutionState();
      }

      // Extract imports
      while ((match = importPattern.exec(code)) !== null) {
        result.imports.push({
          module: match[1],
          line: code.substr(0, match.index).split('\n').length
        });
      }

      // Extract comments
      while ((match = commentPattern.exec(code)) !== null) {
        result.comments.push({
          type: 'singleLine',
          content: (match[1] || '').trim(),
          line: code.substr(0, match.index).split('\n').length
        });
      }
      while ((match = multiLineCommentPattern.exec(code)) !== null) {
        result.comments.push({
          type: 'multiLine',
          content: (match[1] || '').trim(),
          startLine: code.substr(0, match.index).split('\n').length,
          endLine: code.substr(0, match.index + match[0].length).split('\n').length
        });
      }
    } else {
      console.warn('Unsupported language.');
      setParsedData(result);
      return;
    }

    console.log(result);

    // Call onParseComplete to handle parsed data
    if (onParseComplete) {
      onParseComplete(result);
    }

    setParsedData(result);
  } catch (error) {
    console.error('Error parsing code:', error);
    setParsedData(result);
  }
};


    parseCode();
  }, [code, language, setParsedData, onParseComplete]);

  return null;
};

export default CodeParser;
