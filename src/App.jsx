import React, { useState, useEffect } from 'react';
import './App.css';
import CodeInput from './components/CodeInput';
import Buttons from './components/Buttons';
import OutputArea from './components/OutputArea';
import CodeParser from './components/CodeParser';
import Popup from './components/Popup'; // Import Popup component
import Navbar from './components/Navbar';
import axios from 'axios';

const App = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [showPopup, setShowPopup] = useState(false);  // Popup state
  const [aiAnswer, setAiAnswer] = useState('');       // AI answer state
  const [parsedData, setParsedData] = useState(null); // Parsed data state

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js';
        script.onload = async () => {
          const pyodideInstance = await window.loadPyodide();
          setPyodide(pyodideInstance);
        };
        script.onerror = (error) => {
          console.error('Failed to load Pyodide:', error);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Pyodide:', error);
      }
    };
    loadPyodide();
  }, []);

  const handleRunClick = async () => {
    try {
      let result;
      if (language === 'javascript') {
        const func = new Function(code + `\nreturn;`);
        const log = [];
        console.log = (message) => log.push(message); // Override console.log
        func();
        result = log.join('\n');
      } else if (language === 'python' && pyodide) {
        result = await pyodide.runPythonAsync(`
import io
import sys

output = io.StringIO()
sys.stdout = output

${code}

sys.stdout = sys.__stdout__

output.getvalue()
        `);
      }
      setOutput(result !== undefined && result !== null ? result.toString() : 'No output');
    } catch (error) {
      console.error('Error:', error.message);
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleVisualizeClick = async (parsedData) => {
    try {
      const prompt = {
  "task": "Create a fully functional HTML document that visualizes the execution of the provided code using horizontal bars. The visualization should break down the execution into individual steps and dynamically represent code operations. Implement the complete solution in HTML, CSS, and JavaScript.",
  "features": {
    "arrayRepresentation": "Use horizontal bars to represent array elements visually. Adjust the height of these bars dynamically based on execution steps.",
    "barsMovement": "Highlight and move the bars to show the current processing step. Reflect changes in code execution visually.",
    "controls": {
      "Next": "Advances the visualization to the next step.",
      "Previous": "Moves the visualization back to the previous step.",
      "Play": "Automatically progresses through all steps.",
      "Stop": "Pauses the automatic progression."
    },
    "colorChange": "Bars should change color to reflect different states, such as the current processing step.",
    "valueLabels": "Display the value of each bar above it.",
    "finalOutputDisplay": "Show the final result in a separate bar chart once the operations are complete.",
    "uiConsistency": "Ensure a consistent user interface style and layout throughout the visualization."
  },
  "instructions": "Provide the complete HTML, CSS, and JavaScript code to implement the visualization. Include all parts of the code covering initialization, execution, and final output display. Ensure each button has its own functionality and the code flow is clearly represented on the bars with appropriate color changes.",
  "parsedData": parsedData,
  "code" : code,
  "fileFormat": "html"
};

      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
        method: 'post',
        data: {
          contents: [{ parts: [{ text: JSON.stringify(prompt) }] }]
        }
      });

      setAiAnswer(response.data.candidates[0].content.parts[0].text);
      setShowPopup(true);  // Show the popup with AI answer
    } catch (error) {
      console.log(error);
      setAiAnswer('Sorry - Something went wrong. Please try again!');
      setShowPopup(true);  // Show the error in popup
    }
  };

  // Handle static code explanation from AI
  const handleExplainCodeClick = async () => {
    try {
      const prompt = {
        task: "Explain the following code step by step:",
        code,
        language
      };

      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
        method: 'post',
        data: {
          contents: [{ parts: [{ text: JSON.stringify(prompt) }] }]
        }
      });

      setAiAnswer(response.data.candidates[0].content.parts[0].text);
      setShowPopup(true);  // Show the explanation in popup
    } catch (error) {
      console.log(error);
      setAiAnswer('Sorry - Something went wrong. Please try again!');
      setShowPopup(true);
    }
  };

  return (
    <>
      {/* Add Navbar component */}
      <Navbar />

      <div className="container">
        <div className="left-side">
          <div className="code-area">
            <CodeInput code={code} setCode={setCode} language={language} />
          </div>
          <div className="buttons">
            <Buttons 
              setLanguage={setLanguage} 
              handleRunClick={handleRunClick} 
              handleVisualizeClick={() => handleVisualizeClick(parsedData)}  // Pass parsed data to visualize handler
              handleExplainCodeClick={handleExplainCodeClick}  // Add new handler for explanation
            />
          </div>
          <div className="output-area">
            <OutputArea output={output} />
          </div>
        </div>

        {showPopup && (
          <Popup content={aiAnswer} onClose={() => setShowPopup(false)} />
        )}
      </div>
    </>
  );
};

export default App;