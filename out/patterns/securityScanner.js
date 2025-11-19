"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanner = void 0;
const vulnerabilityPatterns_1 = require("./vulnerabilityPatterns");
class SecurityScanner {
    constructor(aiEngine) {
        this.aiEngine = aiEngine;
        this.patterns = vulnerabilityPatterns_1.vulnerabilityPatterns;
    }
    async scan(code, language) {
        const vulnerabilities = [];
        // Phase 1: Fast pattern-based detection
        const patternVulns = this.patternScan(code, language);
        vulnerabilities.push(...patternVulns);
        // Phase 2: AI-enhanced deep analysis (if enabled and warranted)
        if (this.shouldRunAIAnalysis(code, patternVulns)) {
            try {
                const aiVulns = await this.aiEngine.analyzeCode(code, language, patternVulns);
                vulnerabilities.push(...aiVulns);
            }
            catch (error) {
                console.error('AI analysis failed:', error);
            }
        }
        return this.deduplicateAndPrioritize(vulnerabilities);
    }
    patternScan(code, language) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        // Filter patterns for this language
        const applicablePatterns = this.patterns.filter(p => p.languages.includes(language) || p.languages.includes('*'));
        // Scan each line with each pattern
        applicablePatterns.forEach(pattern => {
            lines.forEach((line, lineIndex) => {
                const matches = [...line.matchAll(pattern.regex)];
                matches.forEach(match => {
                    if (match.index !== undefined) {
                        vulnerabilities.push({
                            type: pattern.type,
                            severity: pattern.severity,
                            line: lineIndex,
                            column: match.index,
                            length: match[0].length,
                            message: pattern.message,
                            explanation: pattern.explanation,
                            fix: pattern.fix,
                            codeExample: pattern.codeExample,
                            cwe: pattern.cwe
                        });
                    }
                });
            });
        });
        return vulnerabilities;
    }
    shouldRunAIAnalysis(code, patternVulns) {
        const vscode = require('vscode');
        const config = vscode.workspace.getConfiguration('securityCopilot');
        const aiEnabled = config.get('enableAI', true);
        if (!aiEnabled)
            return false;
        // Complex patterns that trigger AI scan
        const complexPatterns = [
            /crypto|encrypt|decrypt|hash/i,
            /jwt|token|session|auth/i,
            /password|secret|api[_-]?key|credential/i,
            /eval|exec|system|shell|command/i,
            /serialize|pickle|yaml\.load/i,
            /xml|xpath|ldap/i
        ];
        const hasComplexPattern = complexPatterns.some(pattern => pattern.test(code));
        const hasCriticalVuln = patternVulns.some(v => v.severity === 'critical');
        return hasComplexPattern || hasCriticalVuln || patternVulns.length > 3;
    }
    deduplicateAndPrioritize(vulns) {
        const unique = Array.from(new Map(vulns.map(v => [`${v.line}-${v.column}-${v.type}`, v])).values());
        const severityOrder = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3
        };
        return unique.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }
    // Public method to add custom patterns
    addCustomPattern(pattern) {
        this.patterns.push(pattern);
    }
    // Public method to get all patterns
    getPatterns() {
        return [...this.patterns];
    }
}
exports.SecurityScanner = SecurityScanner;
//# sourceMappingURL=securityScanner.js.map