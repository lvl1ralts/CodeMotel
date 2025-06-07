import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProblemList from '../components/Problems/ProblemList';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import OutputPanel from '../components/CodeEditor/OutputPanel';
import { Plus, Play } from 'lucide-react';

const Problems = () => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    // Set starter code if available
    if (problem.starterCode && problem.starterCode[language]) {
      setCode(problem.starterCode[language]);
    } else {
      setCode('// Start coding here...\n');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      // Simulate code execution
      setTimeout(() => {
        setOutput({
          success: true,
          result: 'Code executed successfully!\nOutput: Hello, World!'
        });
        setIsRunning(false);
      }, 2000);
    } catch (error) {
      setOutput({
        success: false,
        error: error.message
      });
      setIsRunning(false);
    }
  };

  const handleClearOutput = () => {
    setOutput(null);
  };

  // FIX: Navigate to create problem page instead of showing modal
  const handleCreateProblem = () => {
    navigate('/problems/create');
  };

  return (
    <div className="problems-page">
      <div className="page-header">
        <h1>Coding Problems</h1>
        <p>Challenge yourself and improve your coding skills</p>
        <button 
          onClick={handleCreateProblem}
          className="btn"
        >
          <Plus size={16} />
          Create Problem
        </button>
      </div>

      <div className="problems-layout">
        {/* Problem List Sidebar */}
        <div className="problems-sidebar">
          <ProblemList onProblemSelect={handleProblemSelect} />
        </div>

        {/* Code Editor and Problem Details */}
        <div className="problems-main">
          {selectedProblem ? (
            <div className="problem-workspace">
              {/* Problem Details */}
              <div className="problem-details">
                <div className="problem-header">
                  <h2>{selectedProblem.title}</h2>
                  <span className={`difficulty-badge ${selectedProblem.difficulty.toLowerCase()}`}>
                    {selectedProblem.difficulty}
                  </span>
                </div>
                
                <div className="problem-description">
                  <p>{selectedProblem.description}</p>
                </div>

                {selectedProblem.examples && (
                  <div className="problem-examples">
                    <h3>Examples:</h3>
                    {selectedProblem.examples.map((example, index) => (
                      <div key={index} className="example">
                        <div className="example-input">
                          <strong>Input:</strong> {example.input}
                        </div>
                        <div className="example-output">
                          <strong>Output:</strong> {example.output}
                        </div>
                        {example.explanation && (
                          <div className="example-explanation">
                            <strong>Explanation:</strong> {example.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedProblem.constraints && (
                  <div className="problem-constraints">
                    <h3>Constraints:</h3>
                    <ul>
                      {selectedProblem.constraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="code-workspace">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  onRun={handleRunCode}
                />
                
                <OutputPanel
                  output={output}
                  isRunning={isRunning}
                  onClear={handleClearOutput}
                />
              </div>
            </div>
          ) : (
            <div className="no-problem-selected">
              <div className="placeholder-content">
                <Play size={48} />
                <h3>Select a Problem to Start Coding</h3>
                <p>Choose a problem from the list to begin solving</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Problems;
