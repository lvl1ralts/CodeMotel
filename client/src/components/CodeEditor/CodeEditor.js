import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Share } from 'lucide-react';

const CodeEditor = ({ 
  value = '', 
  onChange, 
  language = 'javascript', 
  onRun,
  readOnly = false 
}) => {
  const [code, setCode] = useState(value);
  const [theme, setTheme] = useState('vs-dark');

  const handleEditorChange = (newValue) => {
    setCode(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code);
    }
  };

  const starterCode = {
    javascript: `// Welcome to ZCoder!
function solution() {
    console.log("Hello, World!");
    return "Hello from ZCoder!";
}

solution();`,
    python: `# Welcome to ZCoder!
def solution():
    print("Hello, World!")
    return "Hello from ZCoder!"

solution()`,
    java: `// Welcome to ZCoder!
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    cpp: `// Welcome to ZCoder!
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
  };

  useEffect(() => {
    if (!value && starterCode[language]) {
      setCode(starterCode[language]);
    }
  }, [language]);

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="editor-controls">
          <select 
            value={language} 
            onChange={(e) => onChange && onChange(code, e.target.value)}
            className="language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
          >
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>

        <div className="editor-actions">
          <button onClick={handleRun} className="btn">
            <Play size={16} />
            Run
          </button>
          <button className="btn btn-secondary">
            <Save size={16} />
            Save
          </button>
          <button className="btn btn-secondary">
            <Share size={16} />
            Share
          </button>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          height="400px"
          language={language}
          value={code}
          theme={theme}
          onChange={handleEditorChange}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
