import * as vscode from 'vscode';
import { Vulnerability } from '../patterns/securityScanner';
export declare class SecurityDiagnostics {
    /**
     * Converts vulnerabilities into VS Code diagnostics that appear in the Problems panel
     */
    static createDiagnostics(document: vscode.TextDocument, vulnerabilities: Vulnerability[]): vscode.Diagnostic[];
    private static createDiagnostic;
    private static formatMessage;
    private static formatDetailedExplanation;
    private static getSeverity;
    private static getSeverityIcon;
    private static getDiagnosticTags;
    /**
     * Creates a summary report of all vulnerabilities
     */
    static createSecurityReport(vulnerabilities: Vulnerability[]): string;
    private static groupBySeverity;
}
//# sourceMappingURL=diagnostics.d.ts.map