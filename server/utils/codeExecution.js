const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CodeExecutor {
    constructor() {
        this.timeout = 10000; // 10 seconds timeout
        this.tempDir = path.join(__dirname, '..', 'temp');
        this.ensureTempDir();
    }

    async ensureTempDir() {
        try {
            await fs.access(this.tempDir);
        } catch {
            await fs.mkdir(this.tempDir, { recursive: true });
        }
    }

    generateUniqueId() {
        return crypto.randomBytes(16).toString('hex');
    }

    async executeJavaScript(code, input = '') {
        const fileName = `script_${this.generateUniqueId()}.js`;
        const filePath = path.join(this.tempDir, fileName);

        try {
            // Wrap user code in a safe execution context
            const wrappedCode = `
                const console = {
                    log: (...args) => process.stdout.write(args.join(' ') + '\\n'),
                    error: (...args) => process.stderr.write(args.join(' ') + '\\n')
                };
                
                // Disable dangerous functions
                const process = undefined;
                const require = undefined;
                const module = undefined;
                const exports = undefined;
                const global = undefined;
                const Buffer = undefined;
                
                try {
                    ${code}
                } catch (error) {
                    console.error('Runtime Error: ' + error.message);
                }
            `;

            await fs.writeFile(filePath, wrappedCode);

            return new Promise((resolve) => {
                const child = exec(
                    `node "${filePath}"`,
                    { 
                        timeout: this.timeout,
                        maxBuffer: 1024 * 1024 // 1MB buffer
                    },
                    async (error, stdout, stderr) => {
                        try {
                            await fs.unlink(filePath);
                        } catch (unlinkError) {
                            console.error('Failed to delete temp file:', unlinkError);
                        }

                        if (error) {
                            if (error.code === 'ETIMEDOUT') {
                                resolve({
                                    success: false,
                                    error: 'Code execution timed out (10 seconds limit)',
                                    executionTime: this.timeout
                                });
                            } else {
                                resolve({
                                    success: false,
                                    error: stderr || error.message,
                                    executionTime: 0
                                });
                            }
                        } else {
                            resolve({
                                success: true,
                                output: stdout,
                                error: stderr,
                                executionTime: Date.now() - startTime
                            });
                        }
                    }
                );

                const startTime = Date.now();

                // Send input to the process if provided
                if (input) {
                    child.stdin.write(input);
                    child.stdin.end();
                }
            });
        } catch (error) {
            return {
                success: false,
                error: 'Failed to execute code: ' + error.message,
                executionTime: 0
            };
        }
    }

    async executePython(code, input = '') {
        const fileName = `script_${this.generateUniqueId()}.py`;
        const filePath = path.join(this.tempDir, fileName);

        try {
            // Add safety restrictions for Python
            const wrappedCode = `
import sys
import os

# Restrict dangerous modules
restricted_modules = ['os', 'subprocess', 'socket', 'urllib', 'requests', 'http']

class RestrictedImport:
    def __init__(self, restricted_modules):
        self.restricted_modules = restricted_modules
        
    def __call__(self, name, *args, **kwargs):
        if name in self.restricted_modules:
            raise ImportError(f"Module '{name}' is restricted")
        return self.original_import(name, *args, **kwargs)

# Install the import hook
import builtins
restricted_import = RestrictedImport(restricted_modules)
restricted_import.original_import = builtins.__import__
builtins.__import__ = restricted_import

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Runtime Error: {e}", file=sys.stderr)
            `;

            await fs.writeFile(filePath, wrappedCode);

            return new Promise((resolve) => {
                const child = exec(
                    `python3 "${filePath}"`,
                    { 
                        timeout: this.timeout,
                        maxBuffer: 1024 * 1024
                    },
                    async (error, stdout, stderr) => {
                        try {
                            await fs.unlink(filePath);
                        } catch (unlinkError) {
                            console.error('Failed to delete temp file:', unlinkError);
                        }

                        if (error) {
                            if (error.code === 'ETIMEDOUT') {
                                resolve({
                                    success: false,
                                    error: 'Code execution timed out (10 seconds limit)',
                                    executionTime: this.timeout
                                });
                            } else {
                                resolve({
                                    success: false,
                                    error: stderr || error.message,
                                    executionTime: 0
                                });
                            }
                        } else {
                            resolve({
                                success: true,
                                output: stdout,
                                error: stderr,
                                executionTime: Date.now() - startTime
                            });
                        }
                    }
                );

                const startTime = Date.now();

                if (input) {
                    child.stdin.write(input);
                    child.stdin.end();
                }
            });
        } catch (error) {
            return {
                success: false,
                error: 'Failed to execute Python code: ' + error.message,
                executionTime: 0
            };
        }
    }

    async executeJava(code, input = '') {
        const className = `Solution${this.generateUniqueId()}`;
        const fileName = `${className}.java`;
        const filePath = path.join(this.tempDir, fileName);

        try {
            // Extract class name from code or use generated one
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            const actualClassName = classMatch ? classMatch[1] : className;
            
            let processedCode = code;
            if (!classMatch) {
                processedCode = `public class ${className} {\n${code}\n}`;
            }

            await fs.writeFile(filePath, processedCode);

            return new Promise((resolve) => {
                // First compile the Java code
                exec(
                    `javac "${filePath}"`,
                    { timeout: this.timeout },
                    async (compileError, compileStdout, compileStderr) => {
                        if (compileError) {
                            try {
                                await fs.unlink(filePath);
                            } catch {}
                            
                            resolve({
                                success: false,
                                error: 'Compilation Error: ' + compileStderr,
                                executionTime: 0
                            });
                            return;
                        }

                        // If compilation successful, run the code
                        const classFile = filePath.replace('.java', '.class');
                        const child = exec(
                            `java -cp "${this.tempDir}" ${actualClassName}`,
                            { 
                                timeout: this.timeout,
                                maxBuffer: 1024 * 1024
                            },
                            async (runError, stdout, stderr) => {
                                // Clean up files
                                try {
                                    await fs.unlink(filePath);
                                    await fs.unlink(classFile);
                                } catch {}

                                if (runError) {
                                    if (runError.code === 'ETIMEDOUT') {
                                        resolve({
                                            success: false,
                                            error: 'Code execution timed out (10 seconds limit)',
                                            executionTime: this.timeout
                                        });
                                    } else {
                                        resolve({
                                            success: false,
                                            error: stderr || runError.message,
                                            executionTime: 0
                                        });
                                    }
                                } else {
                                    resolve({
                                        success: true,
                                        output: stdout,
                                        error: stderr,
                                        executionTime: Date.now() - startTime
                                    });
                                }
                            }
                        );

                        const startTime = Date.now();

                        if (input) {
                            child.stdin.write(input);
                            child.stdin.end();
                        }
                    }
                );
            });
        } catch (error) {
            return {
                success: false,
                error: 'Failed to execute Java code: ' + error.message,
                executionTime: 0
            };
        }
    }

    async executeCpp(code, input = '') {
        const fileName = `program_${this.generateUniqueId()}.cpp`;
        const filePath = path.join(this.tempDir, fileName);
        const executablePath = filePath.replace('.cpp', '');

        try {
            await fs.writeFile(filePath, code);

            return new Promise((resolve) => {
                // Compile C++ code
                exec(
                    `g++ -o "${executablePath}" "${filePath}" -std=c++17`,
                    { timeout: this.timeout },
                    async (compileError, compileStdout, compileStderr) => {
                        if (compileError) {
                            try {
                                await fs.unlink(filePath);
                            } catch {}
                            
                            resolve({
                                success: false,
                                error: 'Compilation Error: ' + compileStderr,
                                executionTime: 0
                            });
                            return;
                        }

                        // Execute compiled program
                        const child = exec(
                            `"${executablePath}"`,
                            { 
                                timeout: this.timeout,
                                maxBuffer: 1024 * 1024
                            },
                            async (runError, stdout, stderr) => {
                                // Clean up files
                                try {
                                    await fs.unlink(filePath);
                                    await fs.unlink(executablePath);
                                } catch {}

                                if (runError) {
                                    if (runError.code === 'ETIMEDOUT') {
                                        resolve({
                                            success: false,
                                            error: 'Code execution timed out (10 seconds limit)',
                                            executionTime: this.timeout
                                        });
                                    } else {
                                        resolve({
                                            success: false,
                                            error: stderr || runError.message,
                                            executionTime: 0
                                        });
                                    }
                                } else {
                                    resolve({
                                        success: true,
                                        output: stdout,
                                        error: stderr,
                                        executionTime: Date.now() - startTime
                                    });
                                }
                            }
                        );

                        const startTime = Date.now();

                        if (input) {
                            child.stdin.write(input);
                            child.stdin.end();
                        }
                    }
                );
            });
        } catch (error) {
            return {
                success: false,
                error: 'Failed to execute C++ code: ' + error.message,
                executionTime: 0
            };
        }
    }

    async executeCode(language, code, input = '') {
        // Basic security check
        if (this.containsMaliciousCode(code)) {
            return {
                success: false,
                error: 'Code contains potentially dangerous operations',
                executionTime: 0
            };
        }

        switch (language.toLowerCase()) {
            case 'javascript':
            case 'js':
                return await this.executeJavaScript(code, input);
            
            case 'python':
            case 'py':
                return await this.executePython(code, input);
            
            case 'java':
                return await this.executeJava(code, input);
            
            case 'cpp':
            case 'c++':
                return await this.executeCpp(code, input);
            
            default:
                return {
                    success: false,
                    error: `Language '${language}' is not supported`,
                    executionTime: 0
                };
        }
    }

    containsMaliciousCode(code) {
        const dangerousPatterns = [
            /require\s*\(\s*['"`]fs['"`]\s*\)/,
            /require\s*\(\s*['"`]child_process['"`]\s*\)/,
            /require\s*\(\s*['"`]os['"`]\s*\)/,
            /import\s+os/,
            /import\s+subprocess/,
            /import\s+socket/,
            /exec\s*\(/,
            /eval\s*\(/,
            /system\s*\(/,
            /Runtime\.getRuntime\(\)/,
            /ProcessBuilder/,
            /__import__/,
            /open\s*\(/  // For file operations
        ];

        return dangerousPatterns.some(pattern => pattern.test(code));
    }

    async runTests(language, code, testCases) {
        const results = [];
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = await this.executeCode(language, code, testCase.input);
            
            const passed = result.success && 
                          result.output?.trim() === testCase.expectedOutput?.trim();
            
            results.push({
                testCase: i + 1,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: result.output?.trim() || '',
                passed,
                error: result.error,
                executionTime: result.executionTime
            });
        }

        const passedTests = results.filter(r => r.passed).length;
        const totalTests = results.length;

        return {
            success: passedTests > 0,
            passedTests,
            totalTests,
            allPassed: passedTests === totalTests,
            results
        };
    }
}

module.exports = new CodeExecutor();
