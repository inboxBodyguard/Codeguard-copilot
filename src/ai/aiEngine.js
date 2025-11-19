"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISecurityEngine = void 0;
var vscode = require("vscode");
var AISecurityEngine = /** @class */ (function () {
    function AISecurityEngine() {
        var config = vscode.workspace.getConfiguration('securityCopilot');
        this.provider = config.get('aiProvider', 'anthropic');
        this.apiKey = config.get('apiKey', process.env.ANTHROPIC_API_KEY || '') || '';
        this.apiEndpoint = this.getApiEndpoint();
    }
    AISecurityEngine.prototype.getApiEndpoint = function () {
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
    };
    AISecurityEngine.prototype.analyzeCode = function (code, language, existingVulns) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.apiKey) {
                            console.warn('No API key configured. Skipping AI analysis.');
                            return [2 /*return*/, []];
                        }
                        if (code.split('\n').length > 1000) {
                            console.log('File too large for AI analysis');
                            return [2 /*return*/, []];
                        }
                        prompt = this.buildSecurityPrompt(code, language, existingVulns);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.callAI(prompt)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, this.parseAIResponse(response, code)];
                    case 3:
                        error_1 = _a.sent();
                        console.error('AI analysis failed:', error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AISecurityEngine.prototype.buildSecurityPrompt = function (code, language, existingVulns) {
        var vulnTypes = existingVulns.map(function (v) { return v.type; }).join(', ');
        return "You are a security expert analyzing ".concat(language, " code for vulnerabilities.\n\n").concat(existingVulns.length > 0 ? "Pattern-based scanner already found: ".concat(vulnTypes, "\n") : '', "\n\nCode to analyze:\n```").concat(language, "\n").concat(code, "\n```\n\nPerform deep security analysis and identify:\n\n1. Vulnerabilities missed by pattern matching (logic flaws, race conditions, business logic issues)\n1. Context-aware issues (authentication bypasses, authorization flaws)\n1. Framework-specific security anti-patterns\n1. Subtle injection vulnerabilities\n1. Cryptographic misuse\n1. Session management issues\n\nFor EACH vulnerability, provide:\n\n- type: Name of vulnerability\n- severity: \"critical\", \"high\", \"medium\", or \"low\"\n- line: Line number (0-indexed) where issue occurs\n- explanation: Clear explanation of why this is a security risk\n- fix: Specific remediation advice\n- codeExample: Working code example showing the secure version\n- cwe: CWE identifier (e.g., \"CWE-89\")\n\nIMPORTANT: Return ONLY a valid JSON array, no other text. Format:\n[{\n\"type\": \"vulnerability name\",\n\"severity\": \"critical\",\n\"line\": 5,\n\"explanation\": \"detailed risk explanation\",\n\"fix\": \"how to fix this\",\n\"codeExample\": \"secure code example\",\n\"cwe\": \"CWE-XXX\"\n}]\n\nIf no additional vulnerabilities found, return: []");
    };
    AISecurityEngine.prototype.callAI = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.provider;
                        switch (_a) {
                            case 'anthropic': return [3 /*break*/, 1];
                            case 'groq': return [3 /*break*/, 3];
                            case 'openai': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.callClaude(prompt)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.callGroq(prompt)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.callOpenAI(prompt)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: throw new Error("Unsupported AI provider: ".concat(this.provider));
                }
            });
        });
    };
    AISecurityEngine.prototype.callClaude = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch(this.apiEndpoint, {
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
                        })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok) {
                            throw new Error("Claude API error: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _c.sent();
                        return [2 /*return*/, ((_b = (_a = data.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) || ''];
                }
            });
        });
    };
    AISecurityEngine.prototype.callGroq = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, fetch(this.apiEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(this.apiKey)
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
                        })];
                    case 1:
                        response = _d.sent();
                        if (!response.ok) {
                            throw new Error("Groq API error: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _d.sent();
                        return [2 /*return*/, ((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || ''];
                }
            });
        });
    };
    AISecurityEngine.prototype.callOpenAI = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, fetch(this.apiEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(this.apiKey)
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
                        })];
                    case 1:
                        response = _d.sent();
                        if (!response.ok) {
                            throw new Error("OpenAI API error: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _d.sent();
                        return [2 /*return*/, ((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || ''];
                }
            });
        });
    };
    AISecurityEngine.prototype.parseAIResponse = function (response, code) {
        var _this = this;
        try {
            var jsonText = response;
            var jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
            }
            var vulnerabilities = JSON.parse(jsonText);
            if (!Array.isArray(vulnerabilities)) {
                console.error('AI response is not an array');
                return [];
            }
            var lines_1 = code.split('\n');
            return vulnerabilities.map(function (v) { return ({
                type: v.type || 'Unknown Vulnerability',
                severity: _this.normalizeSeverity(v.severity),
                line: Math.min(v.line || 0, lines_1.length - 1),
                column: 0,
                length: 100,
                message: v.type || 'Security issue detected',
                explanation: v.explanation || 'No explanation provided',
                fix: v.fix || 'Review this code for security issues',
                codeExample: v.codeExample,
                cwe: v.cwe
            }); });
        }
        catch (error) {
            console.error('Failed to parse AI response:', error);
            console.log('Raw response:', response);
            return [];
        }
    };
    AISecurityEngine.prototype.normalizeSeverity = function (severity) {
        var normalized = (severity || 'medium').toLowerCase();
        if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
            return normalized;
        }
        return 'medium';
    };
    AISecurityEngine.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testPrompt, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        testPrompt = 'Respond with only: {"status": "ok"}';
                        return [4 /*yield*/, this.callAI(testPrompt)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.includes('ok')];
                    case 2:
                        error_2 = _a.sent();
                        console.error('AI connection test failed:', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AISecurityEngine;
}());
exports.AISecurityEngine = AISecurityEngine;
