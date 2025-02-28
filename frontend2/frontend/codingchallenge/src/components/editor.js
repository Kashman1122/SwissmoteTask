import { useEffect, useState } from "react";

export default function Editor() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python"); // Default language
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showTestCases, setShowTestCases] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  
    // Load challenge data from localStorage
    const storedChallenge = localStorage.getItem("currentChallenge");
    if (storedChallenge) {
      const parsedChallenge = JSON.parse(storedChallenge);
      setSelectedChallenge(parsedChallenge);
      
      // Fetch fresh data from API to get latest test cases
      fetchChallengeFromAPI(parsedChallenge.id);
    } else {
      // Get challenge ID from URL if not in localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const challengeId = urlParams.get("challengeId");
      if (challengeId) {
        fetchChallengeFromAPI(challengeId);
      }
    }
  }, []);



  
  
  // Function to fetch challenge directly from API
  const fetchChallengeFromAPI = async (challengeId) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/challenge/");
      const challenges = await response.json();
      
      // Find the challenge with matching ID
      const matchingChallenge = challenges.find(c => c.id === parseInt(challengeId));
      
      if (matchingChallenge) {
        console.log("Found matching challenge from API:", matchingChallenge);
        console.log("Test cases from API:", matchingChallenge.test_cases);
        
        // Update selected challenge with the fresh data
        setSelectedChallenge(matchingChallenge);
      }
    } catch (error) {
      console.error("Error fetching challenges from API:", error);
    }
  };

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    // Get the challenge from localStorage (match the key with what we set in Challenges)
    const storedChallenge = localStorage.getItem("currentChallenge");
    if (storedChallenge) {
      const challenge = JSON.parse(storedChallenge);
      setSelectedChallenge(challenge);
      
      // Set initial code based on selected language and challenge
      setInitialCode(challenge, language);
    } else {
      // Fallback to window.location for navigation without router
      window.location.href = "/";
    }
  }, []);

  // Set initial code based on selected language and challenge
  const setInitialCode = (challenge, lang) => {
    // Check if there's saved code for this challenge
    const savedCode = localStorage.getItem(`code_${challenge.id}_${lang}`);
    if (savedCode) {
      setCode(savedCode);
      return;
    }

    // Otherwise set default starter code
    switch(lang) {
      case "Python":
        setCode(`# ${challenge.title}\n# ${challenge.description}\n\ndef solution(${challenge.function_signature || ""}):\n    # Write your solution here\n    pass\n`);
        break;
      case "C++":
        setCode(`// ${challenge.title}\n// ${challenge.description}\n\n#include <iostream>\n\n${challenge.cpp_signature || "int solution() {\n    // Write your solution here\n    return 0;\n}"}\n\nint main() {\n    // Test your solution\n    auto result = solution();\n    std::cout << result << std::endl;\n    return 0;\n}\n`);
        break;
      case "C":
        setCode(`// ${challenge.title}\n// ${challenge.description}\n\n#include <stdio.h>\n\n${challenge.c_signature || "int solution() {\n    // Write your solution here\n    return 0;\n}"}\n\nint main() {\n    // Test your solution\n    int result = solution();\n    printf(\"%d\\n\", result);\n    return 0;\n}\n`);
        break;
      default:
        setCode(`// Write your solution for ${challenge.title}`);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    // Save current code before switching
    if (selectedChallenge) {
      localStorage.setItem(`code_${selectedChallenge.id}_${language}`, code);
    }
    
    setLanguage(newLanguage);
    
    // Load code for the new language
    if (selectedChallenge) {
      setInitialCode(selectedChallenge, newLanguage);
    }
  };

  // Handle code changes
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // Save code to localStorage as user types (debounced in production)
    if (selectedChallenge) {
      localStorage.setItem(`code_${selectedChallenge.id}_${language}`, newCode);
    }
  };

  // Toggle test cases visibility
  const toggleTestCases = () => {
    setShowTestCases(!showTestCases);
  };

  // Run code and validate
  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");
    setTestResults([]);
    
    try {
      // Prepare submission data
      const submission = {
        challenge_id: selectedChallenge.id,
        code: code,
        language: language,
        username: username
      };
      
      // Send code to backend for execution and validation
      const response = await fetch("http://127.0.0.1:8000/submissions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });
      
      const result = await response.json();
      
      // Update the UI with results
      setOutput(result.feedback || "Code executed successfully");
      setTestResults(result.test_results || []);
      
      // Update progress in local storage
      if (result.is_valid) {
        const completedChallenges = JSON.parse(localStorage.getItem("completedChallenges") || "[]");
        
        if (!completedChallenges.includes(selectedChallenge.id)) {
          completedChallenges.push(selectedChallenge.id);
          localStorage.setItem("completedChallenges", JSON.stringify(completedChallenges));
        }
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-layout">
        {/* Challenge details on the left side */}
        <div className="challenge-panel">
          {selectedChallenge ? (
            <div className="challenge-details">
              <h2>{selectedChallenge.title}</h2>
              <div className="challenge-info">
                <p><strong>Difficulty:</strong> {selectedChallenge.difficulty}</p>
                <p><strong>Category:</strong> {selectedChallenge.category}</p>
                <p><strong>Points:</strong> {selectedChallenge.points || 0}</p>
              </div>
              <div className="challenge-description">
                <h3>Description</h3>
                <p>{selectedChallenge.description || "Complete the coding challenge according to the requirements."}</p>
              </div>
              
{/* Expected Output Section */}
<div className="expected-output">
  <h3>Expected Output</h3>
  <pre>{selectedChallenge.expected_output || "Output will be validated against test cases."}</pre>
</div>

{/* Validation Type */}
<div className="validation-type">
  <h3>Validation Type</h3>
  <pre>{selectedChallenge.validation_type || "N/A"}</pre>
</div>

{/* Test Cases Toggle */}
<div className="test-cases-section">
  <div className="test-cases-header" onClick={toggleTestCases}>
    <h3>Test Case</h3>
    <span className="toggle-icon">{showTestCases ? '▼' : '►'}</span>
  </div>

  {showTestCases ? (
    <div>
      {selectedChallenge?.test_cases ? (
        <div className="test-case">
          <h4>Test Case</h4>
          <div className="test-io">
            <div>
              <strong>Input:</strong>
              <pre>
                {selectedChallenge.test_cases.input ? 
                  selectedChallenge.test_cases.input : 
                  "No input data"}
              </pre>
            </div>
            <div>
              <strong>Expected Output:</strong>
              <pre>
                {selectedChallenge.test_cases.output ? 
                  selectedChallenge.test_cases.output : 
                  "No output data"}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <p className="no-test-cases">No test cases available.</p>
      )}
    </div>
  ) : null}
</div>




              
              <div className="language-selector">
                <h3>Select Language</h3>
                <div className="language-buttons">
                  {["Python", "C++", "C"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={language === lang ? "active" : ""}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Loading challenge...</p>
          )}
        </div>

        {/* Code editor and output on the right side */}
        <div className="code-editor-panel">
          <div className="editor-header">
            <h3>Code Editor - {language}</h3>
            <button 
              className="run-button" 
              onClick={runCode} 
              disabled={isRunning}
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={handleCodeChange}
            placeholder={`Write your ${language} code here...`}
            spellCheck="false"
          ></textarea>
          
          {/* Output panel */}
          <div className="output-panel">
            <div className="output-header">
              <h3>Output</h3>
            </div>
            <div className="output-content">
              <pre>{output}</pre>
              
              {testResults.length > 0 && (
                <div className="test-results">
                  <h4>Test Results</h4>
                  {testResults.map((result, index) => (
                    <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
                      <span className="test-status">
                        {result.passed ? '✓' : '✗'} Test {result.test_number}
                      </span>
                      {!result.passed && (
                        <div className="test-details">
                          <div><strong>Input:</strong> {result.input}</div>
                          <div><strong>Expected:</strong> {result.expected}</div>
                          <div><strong>Actual:</strong> {result.actual}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styling */}
      <style jsx>{`
        .editor-container {
          width: 97.5%;
          height: 100vh;
          padding: 20px;
          background-color: #1e1e1e;
          color: white;
        }

        .editor-layout {
          display: flex;
          height: calc(100vh - 100px);
          gap: 20px;
        }

        .challenge-panel {
          flex: 1;
          background-color: #252525;
          border-radius: 8px;
          padding: 20px;
          overflow-y: auto;
        }

        .code-editor-panel {
          flex: 2;
          display: flex;
          flex-direction: column;
          background-color: #252525;
          border-radius: 8px;
          overflow: hidden;
        }

        .challenge-details h2 {
          margin-top: 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #444;
        }

        .challenge-info {
          margin-bottom: 20px;
        }

        .challenge-description {
          margin-bottom: 20px;
        }

        .expected-output {
          margin-bottom: 20px;
        }

        .expected-output pre {
          background-color: #333;
          padding: 10px;
          border-radius: 4px;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .test-cases-section {
          margin-bottom: 20px;
        }

        .test-cases-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 5px 0;
        }

        .test-cases-list {
          background-color: #333;
          padding: 10px;
          border-radius: 4px;
        }

        .test-case {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #444;
        }

        .test-case:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .test-io {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .test-io pre {
          background-color: #222;
          padding: 8px;
          border-radius: 4px;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .language-selector {
          margin-top: 30px;
        }

        .language-buttons {
          display: flex;
          gap: 10px;
        }

        .language-buttons button {
          background-color: #333;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .language-buttons button.active {
          background-color: #007BFF;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: #333;
        }

        .editor-header h3 {
          margin: 0;
        }

        .run-button {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .run-button:hover:not(:disabled) {
          background-color: #218838;
        }

        .run-button:disabled {
          background-color: #555;
          cursor: not-allowed;
        }

        .code-textarea {
          flex: 2;
          width: 100%;
          padding: 15px;
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          border: none;
          resize: none;
          outline: none;
          line-height: 1.5;
        }

        .output-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-top: 1px solid #444;
        }

        .output-header {
          padding: 10px 15px;
          background-color: #333;
        }

        .output-header h3 {
          margin: 0;
        }

        .output-content {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background-color: #1e1e1e;
        }

        .output-content pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .test-results {
          margin-top: 20px;
          border-top: 1px solid #444;
          padding-top: 15px;
        }

        .test-result {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 4px;
        }

        .test-result.passed {
          background-color: rgba(40, 167, 69, 0.2);
          border-left: 3px solid #28a745;
        }

        .test-result.failed {
          background-color: rgba(220, 53, 69, 0.2);
          border-left: 3px solid #dc3545;
        }

        .test-status {
          font-weight: bold;
        }

        .test-details {
          margin-top: 8px;
          padding-left: 15px;
        }
      `}</style>
    </div>
  );
}