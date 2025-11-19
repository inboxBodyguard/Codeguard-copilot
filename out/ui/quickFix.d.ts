import * as vscode from 'vscode';
import { AISecurityEngine } from '../ai/aiEngine';
export declare class SecurityQuickFixProvider implements vscode.CodeActionProvider {
    private aiEngine;
    constructor(aiEngine: AISecurityEngine);
    provideCodeActions(): vscode.CodeAction[];
}
//# sourceMappingURL=quickFix.d.ts.map