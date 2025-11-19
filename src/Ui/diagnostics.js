"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityDiagnostics = void 0;
var vscode = require("vscode");
var SecurityDiagnostics = /** @class */ (function () {
    function SecurityDiagnostics() {
    }
    /**
     * Converts vulnerabilities into VS Code diagnostics that appear in the Problems panel
     */
    SecurityDiagnostics.createDiagnostics = function (document, vulnerabilities) {
        var _this = this;
        return vulnerabilities.map(function (vuln) { return _this.createDiagnostic(document, vuln); });
    };
    SecurityDiagnostics.createDiagnostic = function (document, vuln) {
        var _a;
        // Get the actual line from document
        var line = document.lineAt(Math.min(vuln.line, document.lineCount - 1));
        // Create range for the problematic code
        var range = new vscode.Range(vuln.line, vuln.column, vuln.line, Math.min(vuln.column + ((_a = vuln.length) !== null && _a !== void 0 ? _a : 0), line.text.length));
        // Create the diagnostic with formatted message
        var diagnostic = new vscode.Diagnostic(range, this.formatMessage(vuln), this.getSeverity(vuln.severity));
        // Add metadata
        diagnostic.source = 'Security Co-pilot';
        diagnostic.code = vuln.cwe;
        // Add detailed information that shows on hover
        diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, range), this.formatDetailedExplanation(vuln))
        ];
        // Add tags for better categorization
        diagnostic.tags = this.getDiagnosticTags(vuln);
        return diagnostic;
    };
    SecurityDiagnostics.formatMessage = function (vuln) {
        var icon = this.getSeverityIcon(vuln.severity);
        return "".concat(icon, " ").concat(vuln.type, ": ").concat(vuln.message);
    };
    SecurityDiagnostics.formatDetailedExplanation = function (vuln) {
        var _a, _b;
        var parts = [];
        // Why is this vulnerable?
        parts.push('⚠️  WHY IS THIS DANGEROUS?');
        parts.push((_a = vuln.explanation) !== null && _a !== void 0 ? _a : '');
        parts.push('');
        // How to fix it
        parts.push('🔧 HOW TO FIX:');
        parts.push((_b = vuln.fix) !== null && _b !== void 0 ? _b : '');
        parts.push('');
        // Code example if available
        if (vuln.codeExample) {
            parts.push('💡 SECURE EXAMPLE:');
            parts.push(vuln.codeExample);
            parts.push('');
        }
        // CWE reference for learning more
        if (vuln.cwe) {
            var cweId = String(vuln.cwe).replace(/CWE-/, '');
            parts.push("\uD83D\uDCDA REFERENCE: ".concat(vuln.cwe));
            parts.push("Learn more: https://cwe.mitre.org/data/definitions/".concat(cweId, ".html"));
        }
        return parts.join('\n');
    };
    SecurityDiagnostics.getSeverity = function (severity) {
        switch (severity) {
            case 'critical':
                return vscode.DiagnosticSeverity.Error;
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    };
    SecurityDiagnostics.getSeverityIcon = function (severity) {
        switch (severity) {
            case 'critical':
                return '🚨';
            case 'high':
                return '⛔';
            case 'medium':
                return '⚠️';
            case 'low':
                return 'ℹ️';
            default:
                return '🔍';
        }
    };
    SecurityDiagnostics.getDiagnosticTags = function (vuln) {
        var _a, _b;
        var tags = [];
        // Mark deprecated patterns
        if (((_a = vuln.type) !== null && _a !== void 0 ? _a : '').includes('Deprecated') || ((_b = vuln.type) !== null && _b !== void 0 ? _b : '').includes('Weak')) {
            tags.push(vscode.DiagnosticTag.Deprecated);
        }
        return tags;
    };
    /**
     * Creates a summary report of all vulnerabilities
     */
    SecurityDiagnostics.createSecurityReport = function (vulnerabilities) {
        if (vulnerabilities.length === 0) {
            return '✅ No security vulnerabilities detected!';
        }
        var bySeverity = this.groupBySeverity(vulnerabilities);
        var report = [];
        report.push('🛡️ SECURITY SCAN REPORT');
        report.push('='.repeat(50));
        report.push('');
        // Summary counts
        report.push("Total Issues Found: ".concat(vulnerabilities.length));
        report.push("  \uD83D\uDEA8 Critical: ".concat(bySeverity.critical.length));
        report.push("  \u26D4 High: ".concat(bySeverity.high.length));
        report.push("  \u26A0\uFE0F  Medium: ".concat(bySeverity.medium.length));
        report.push("  \u2139\uFE0F  Low: ".concat(bySeverity.low.length));
        report.push('');
        // List vulnerabilities by severity
        ['critical', 'high', 'medium', 'low'].forEach(function (severity) {
            var vulns = bySeverity[severity];
            if (vulns.length > 0) {
                report.push("".concat(severity.toUpperCase(), " SEVERITY:"));
                vulns.forEach(function (v, i) {
                    report.push("  ".concat(i + 1, ". ").concat(v.type, " (Line ").concat(v.line + 1, ")"));
                    report.push("     ".concat(v.message));
                });
                report.push('');
            }
        });
        return report.join('\n');
    };
    SecurityDiagnostics.groupBySeverity = function (vulnerabilities) {
        return {
            critical: vulnerabilities.filter(function (v) { return v.severity === 'critical'; }),
            high: vulnerabilities.filter(function (v) { return v.severity === 'high'; }),
            medium: vulnerabilities.filter(function (v) { return v.severity === 'medium'; }),
            low: vulnerabilities.filter(function (v) { return v.severity === 'low'; })
        };
    };
    return SecurityDiagnostics;
}());
exports.SecurityDiagnostics = SecurityDiagnostics;
