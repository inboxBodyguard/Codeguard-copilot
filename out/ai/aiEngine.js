"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISecurityEngine = void 0;
const vscode = __importStar(require("vscode"));
class AISecurityEngine {
    constructor() {
        const config = vscode.workspace.getConfiguration('securityCopilot');
        this.provider = config.get('aiProvider', 'anthropic');
        this.apiKey = config.get('apiKey', process.env.ANTHROPIC_API_KEY || '') || '';
        this.apiEndpoint = this.getApiEndpoint();
    }
    getApiEndpoint() {
        switch (this.provider) {
            case 'anthropic':
                return 'https://api.anthropic.com/v1/messages';
            case 'groq':
                return 'https://api.groq.com/openai/v1/chat/completions';
            case 'openai':
                return 'https://api.openai.com/v1/chat/completions';
            default:
                return 'https://api.anthropic.com/v1/messages';
        }
    }
    async analyzeCode(code, language, existingVulns) {
        if (!this.apiKey) {
            console.warn('No API key configured. Skipping AI analysis.');
            return [];
        }
        if (code.split('\n').length > 1000) {
            console.log('File too large for AI analysis');
            return [];
        }
        const prompt = this.buildSecurityPrompt(code, language, existingVulns);
        try {
            const response = await this.callAI(prompt);
            return this.parseAIResponse(response, code);
        }
        catch (error) {
            console.error('AI analysis failed:', error);
            return [];
        }
    }
    buildSecurityPrompt(code, language, existingVulns) {
        const vulnTypes = existingVulns.map(v => v.type).join(', ');
        return `You are a security expert analyzing ${language} code for vulnerabilities.

${existingVulns.length > 0 ? `Pattern-based scanner already found: ${vulnTypes}\n` : ''}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Perform deep security analysis and identify:

1. Vulnerabilities missed by pattern matching (logic flaws, race conditions, business logic issues)
1. Context-aware issues (authentication bypasses, authorization flaws)
1. Framework-specific security anti-patterns
1. Subtle injection vulnerabilities
1. Cryptographic misuse
1. Session management issues

For EACH vulnerability, provide:

- type: Name of vulnerability
- severity: "critical", "high", "medium", or "low"
- line: Line number (0-indexed) where issue occurs
- explanation: Clear explanation of why this is a security risk
- fix: Specific remediation advice
- codeExample: Working code example showing the secure version
- cwe: CWE identifier (e.g., "CWE-89")

IMPORTANT: Return ONLY a valid JSON array, no other text. Format:
[{
"type": "vulnerability name",
"severity": "critical",
"line": 5,
"explanation": "detailed risk explanation",
"fix": "how to fix this",
"codeExample": "secure code example",
"cwe": "CWE-XXX"
}]

If no additional vulnerabilities found, return: []`;
    }
    async callAI(prompt) {
        switch (this.provider) {
            case 'anthropic':
                return await this.callClaude(prompt);
            case 'groq':
                return await this.callGroq(prompt);
            case 'openai':
                return await this.callOpenAI(prompt);
            default:
                throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
    }
    async callClaude(prompt) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        if (!response.ok) {
            throw new Error(`Claude API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.content?.[0]?.text || '';
    }
    async callGroq(prompt) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1
            })
        });
        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
    async callOpenAI(prompt) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1
            })
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
    parseAIResponse(response, code) {
        try {
            let jsonText = response;
            const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
            }
            const vulnerabilities = JSON.parse(jsonText);
            if (!Array.isArray(vulnerabilities)) {
                console.error('AI response is not an array');
                return [];
            }
            const lines = code.split('\n');
            return vulnerabilities.map((v) => ({
                type: v.type || 'Unknown Vulnerability',
                severity: this.normalizeSeverity(v.severity),
                line: Math.min(v.line || 0, lines.length - 1),
                column: 0,
                length: 100,
                message: v.type || 'Security issue detected',
                explanation: v.explanation || 'No explanation provided',
                fix: v.fix || 'Review this code for security issues',
                codeExample: v.codeExample,
                cwe: v.cwe
            }));
        }
        catch (error) {
            console.error('Failed to parse AI response:', error);
            console.log('Raw response:', response);
            return [];
        }
    }
    normalizeSeverity(severity) {
        const normalized = (severity || 'medium').toLowerCase();
        if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
            return normalized;
        }
        return 'medium';
    }
    async testConnection() {
        try {
            const testPrompt = 'Respond with only: {"status": "ok"}';
            const response = await this.callAI(testPrompt);
            return response.includes('ok');
        }
        catch (error) {
            console.error('AI connection test failed:', error);
            return false;
        }
    }
}
exports.AISecurityEngine = AISecurityEngine;
//# sourceMappingURL=aiEngine.js.map