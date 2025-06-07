// Simplified code execution for production (Vercel-compatible)
class SimpleCodeExecutor {
    constructor() {
        this.timeout = 5000; // 5 seconds max
    }

    async executeJavaScript(code, input = '') {
        try {
            // Create safe execution context
            const safeCode = this.sanitizeJavaScript(code);
            
            // Use VM2 for safer execution (install: npm install vm2)
            const { VM } = require('vm2');
            
            const vm = new VM({
                timeout: this.timeout,
                sandbox: {
                    input: input,
                    output: '',
                    console: {
                        log: (msg) => { vm.sandbox.output += msg + '\n'; }
                    }
                }
            });

            const startTime = Date.now();
            const result = vm.run(safeCode);
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: vm.sandbox.output || result?.toString() || '',
                error: null,
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                output: '',
                error: error.message,
                executionTime: 0
            };
        }
    }

    sanitizeJavaScript(code) {
        // Remove dangerous patterns
        const dangerous = [
            /require\s*\(/g,
            /process\./g,
            /global\./g,
            /Buffer\./g,
            /eval\s*\(/g,
            /Function\s*\(/g
        ];

        let safeCode = code;
        dangerous.forEach(pattern => {
            safeCode = safeCode.replace(pattern, '/* BLOCKED */');
        });

        return safeCode;
    }

    async executeCode(language, code, input = '') {
        switch (language.toLowerCase()) {
            case 'javascript':
            case 'js':
                return await this.executeJavaScript(code, input);
            
            default:
                return {
                    success: false,
                    error: `Language '${language}' is not supported in production environment`,
                    executionTime: 0
                };
        }
    }

    // Mock test runner for production
    async runTests(language, code, testCases) {
        const results = [];
        
        for (let i = 0; i < Math.min(testCases.length, 3); i++) { // Limit to 3 tests
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

module.exports = new SimpleCodeExecutor();
