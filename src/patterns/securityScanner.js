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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanner = void 0;
var vulnerabilityPatterns_1 = require("./vulnerabilityPatterns");
var SecurityScanner = /** @class */ (function () {
    function SecurityScanner(aiEngine) {
        this.aiEngine = aiEngine;
        this.patterns = vulnerabilityPatterns_1.vulnerabilityPatterns;
    }
    SecurityScanner.prototype.scan = function (code, language) {
        return __awaiter(this, void 0, void 0, function () {
            var vulnerabilities, patternVulns, aiVulns, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vulnerabilities = [];
                        patternVulns = this.patternScan(code, language);
                        vulnerabilities.push.apply(vulnerabilities, patternVulns);
                        if (!this.shouldRunAIAnalysis(code, patternVulns)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.aiEngine.analyzeCode(code, language, patternVulns)];
                    case 2:
                        aiVulns = _a.sent();
                        vulnerabilities.push.apply(vulnerabilities, aiVulns);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('AI analysis failed:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, this.deduplicateAndPrioritize(vulnerabilities)];
                }
            });
        });
    };
    SecurityScanner.prototype.patternScan = function (code, language) {
        var vulnerabilities = [];
        var lines = code.split('\n');
        // Filter patterns for this language
        var applicablePatterns = this.patterns.filter(function (p) { return p.languages.includes(language) || p.languages.includes('*'); });
        // Scan each line with each pattern
        applicablePatterns.forEach(function (pattern) {
            lines.forEach(function (line, lineIndex) {
                var matches = __spreadArray([], line.matchAll(pattern.regex), true);
                matches.forEach(function (match) {
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
    };
    SecurityScanner.prototype.shouldRunAIAnalysis = function (code, patternVulns) {
        var vscode = require('vscode');
        var config = vscode.workspace.getConfiguration('securityCopilot');
        var aiEnabled = config.get('enableAI', true);
        if (!aiEnabled)
            return false;
        // Complex patterns that trigger AI scan
        var complexPatterns = [
            /crypto|encrypt|decrypt|hash/i,
            /jwt|token|session|auth/i,
            /password|secret|api[_-]?key|credential/i,
            /eval|exec|system|shell|command/i,
            /serialize|pickle|yaml\.load/i,
            /xml|xpath|ldap/i
        ];
        var hasComplexPattern = complexPatterns.some(function (pattern) { return pattern.test(code); });
        var hasCriticalVuln = patternVulns.some(function (v) { return v.severity === 'critical'; });
        return hasComplexPattern || hasCriticalVuln || patternVulns.length > 3;
    };
    SecurityScanner.prototype.deduplicateAndPrioritize = function (vulns) {
        var unique = Array.from(new Map(vulns.map(function (v) { return ["".concat(v.line, "-").concat(v.column, "-").concat(v.type), v]; })).values());
        var severityOrder = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3
        };
        return unique.sort(function (a, b) { return severityOrder[a.severity] - severityOrder[b.severity]; });
    };
    // Public method to add custom patterns
    SecurityScanner.prototype.addCustomPattern = function (pattern) {
        this.patterns.push(pattern);
    };
    // Public method to get all patterns
    SecurityScanner.prototype.getPatterns = function () {
        return __spreadArray([], this.patterns, true);
    };
    return SecurityScanner;
}());
exports.SecurityScanner = SecurityScanner;
