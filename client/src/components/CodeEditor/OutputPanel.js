import React from 'react';
import { Terminal, X, CheckCircle, XCircle } from 'lucide-react';

const OutputPanel = ({ output, isRunning, onClear }) => {
  const renderOutput = () => {
    if (isRunning) {
      return (
        <div className="output-running">
          <div className="spinner"></div>
          <span>Running code...</span>
        </div>
      );
    }

    if (!output) {
      return (
        <div className="output-placeholder">
          <Terminal size={32} />
          <p>Click "Run" to see output</p>
        </div>
      );
    }

    return (
      <div className="output-content">
        {output.success ? (
          <div className="output-success">
            <CheckCircle size={16} />
            <span>Execution completed</span>
          </div>
        ) : (
          <div className="output-error">
            <XCircle size={16} />
            <span>Execution failed</span>
          </div>
        )}
        
        <div className="output-text">
          <pre>{output.result || output.error}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <h3>Output</h3>
        {output && (
          <button onClick={onClear} className="clear-button">
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="output-body">
        {renderOutput()}
      </div>
    </div>
  );
};

export default OutputPanel;
