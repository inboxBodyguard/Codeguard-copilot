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
exports.SecurityDiagnostics = void 0;
const vscode = __importStar(require("vscode"));
class SecurityDiagnostics {
    /**
     * Converts vulnerabilities into VS Code diagnostics that appear in the Problems panel
     */
    static createDiagnostics(document, vulnerabilities) {
        return vulnerabilities.map(vuln => this.createDiagnostic(document, vuln));
    }
    static createDiagnostic(document, vuln) {
        // Get the actual line from document
        const line = document.lineAt(Math.min(vuln.line, document.lineCount - 1));
        // Create range for the problematic code
        const range = new vscode.Range(vuln.line, vuln.column, vuln.line, Math.min(vuln.column + (vuln.length ?? 0), line.text.length));
        // Create the diagnostic with formatted message
        const diagnostic = new vscode.Diagnostic(range, this.formatMessage(vuln), this.getSeverity(vuln.severity));
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
    }
    static formatMessage(vuln) {
        const icon = this.getSeverityIcon(vuln.severity);
        return `${icon} ${vuln.type}: ${vuln.message}`;
    }
    static formatDetailedExplanation(vuln) {
        const parts = [];
        // Why is this vulnerable?
        parts.push('⚠️  WHY IS THIS DANGEROUS?');
        parts.push(vuln.explanation ?? '');
        parts.push('');
        // How to fix it
        parts.push('🔧 HOW TO FIX:');
        parts.push(vuln.fix ?? '');
        parts.push('');
        // Code example if available
        if (vuln.codeExample) {
            parts.push('💡 SECURE EXAMPLE:');
            parts.push(vuln.codeExample);
            parts.push('');
        }
        // CWE reference for learning more
        if (vuln.cwe) {
            const cweId = String(vuln.cwe).replace(/CWE-/, '');
            parts.push(`📚 REFERENCE: ${vuln.cwe}`);
            parts.push(`Learn more: https://cwe.mitre.org/data/definitions/${cweId}.html`);
        }
        return parts.join('\n');
    }
    static getSeverity(severity) {
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
    }
    static getSeverityIcon(severity) {
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
    }
    static getDiagnosticTags(vuln) {
        const tags = [];
        // Mark deprecated patterns
        if ((vuln.type ?? '').includes('Deprecated') || (vuln.type ?? '').includes('Weak')) {
            tags.push(vscode.DiagnosticTag.Deprecated);
        }
        return tags;
    }
    /**
     * Creates a summary report of all vulnerabilities
     */
    static createSecurityReport(vulnerabilities) {
        if (vulnerabilities.length === 0) {
            return '✅ No security vulnerabilities detected!';
        }
        const bySeverity = this.groupBySeverity(vulnerabilities);
        const report = [];
        report.push('🛡️ SECURITY SCAN REPORT');
        report.push('='.repeat(50));
        report.push('');
        // Summary counts
        report.push(`Total Issues Found: ${vulnerabilities.length}`);
        report.push(`  🚨 Critical: ${bySeverity.critical.length}`);
        report.push(`  ⛔ High: ${bySeverity.high.length}`);
        report.push(`  ⚠️  Medium: ${bySeverity.medium.length}`);
        report.push(`  ℹ️  Low: ${bySeverity.low.length}`);
        report.push('');
        // List vulnerabilities by severity
        ['critical', 'high', 'medium', 'low'].forEach(severity => {
            const vulns = bySeverity[severity];
            if (vulns.length > 0) {
                report.push(`${severity.toUpperCase()} SEVERITY:`);
                vulns.forEach((v, i) => {
                    report.push(`  ${i + 1}. ${v.type} (Line ${v.line + 1})`);
                    report.push(`     ${v.message}`);
                });
                report.push('');
            }
        });
        return report.join('\n');
    }
    static groupBySeverity(vulnerabilities) {
        return {
            critical: vulnerabilities.filter(v => v.severity === 'critical'),
            high: vulnerabilities.filter(v => v.severity === 'high'),
            medium: vulnerabilities.filter(v => v.severity === 'medium'),
            low: vulnerabilities.filter(v => v.severity === 'low')
        };
    }
}
exports.SecurityDiagnostics = SecurityDiagnostics;
//# sourceMappingURL=diagnostics.js.map