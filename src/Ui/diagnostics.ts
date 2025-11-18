import * as vscode from 'vscode';
import { Vulnerability } from '../patterns/securityScanner';

export class SecurityDiagnostics {
    /**
     * Converts vulnerabilities into VS Code diagnostics that appear in the Problems panel
     */
    static createDiagnostics(
        document: vscode.TextDocument,
        vulnerabilities: Vulnerability[]
    ): vscode.Diagnostic[] {
        return vulnerabilities.map(vuln => this.createDiagnostic(document, vuln));
    }

    private static createDiagnostic(
        document: vscode.TextDocument,
        vuln: Vulnerability
    ): vscode.Diagnostic {
        // Get the actual line from document
        const line = document.lineAt(Math.min(vuln.line, document.lineCount - 1));
        
        // Create range for the problematic code
        const range = new vscode.Range(
            vuln.line,
            vuln.column,
            vuln.line,
            Math.min(vuln.column + (vuln.length ?? 0), line.text.length)
        );

        // Create the diagnostic with formatted message
        const diagnostic = new vscode.Diagnostic(
            range,
            this.formatMessage(vuln),
            this.getSeverity(vuln.severity)
        );

        // Add metadata
        diagnostic.source = 'Security Co-pilot';
        diagnostic.code = vuln.cwe;
        
        // Add detailed information that shows on hover
        diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(
                new vscode.Location(document.uri, range),
                this.formatDetailedExplanation(vuln)
            )
        ];

        // Add tags for better categorization
        diagnostic.tags = this.getDiagnosticTags(vuln);

        return diagnostic;
    }

    private static formatMessage(vuln: Vulnerability): string {
        const icon = this.getSeverityIcon(vuln.severity);
        return `${icon} ${vuln.type}: ${vuln.message}`;
    }

    private static formatDetailedExplanation(vuln: Vulnerability): string {
        const parts: string[] = [];

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

    private static getSeverity(severity: string): vscode.DiagnosticSeverity {
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

    private static getSeverityIcon(severity: string): string {
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

    private static getDiagnosticTags(vuln: Vulnerability): vscode.DiagnosticTag[] {
        const tags: vscode.DiagnosticTag[] = [];
        
        // Mark deprecated patterns
        if ((vuln.type ?? '').includes('Deprecated') || (vuln.type ?? '').includes('Weak')) {
            tags.push(vscode.DiagnosticTag.Deprecated);
        }

        return tags;
    }

    /**
     * Creates a summary report of all vulnerabilities
     */
    static createSecurityReport(vulnerabilities: Vulnerability[]): string {
        if (vulnerabilities.length === 0) {
            return '✅ No security vulnerabilities detected!';
        }

        const bySeverity = this.groupBySeverity(vulnerabilities);
        
        const report: string[] = [];
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
        (['critical', 'high', 'medium', 'low'] as const).forEach(severity => {
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

    private static groupBySeverity(vulnerabilities: Vulnerability[]) {
        return {
            critical: vulnerabilities.filter(v => v.severity === 'critical'),
            high: vulnerabilities.filter(v => v.severity === 'high'),
            medium: vulnerabilities.filter(v => v.severity === 'medium'),
            low: vulnerabilities.filter(v => v.severity === 'low')
        };
    }
}