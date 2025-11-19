import * as vscode from 'vscode';
import { AISecurityEngine } from '../ai/aiEngine';

export class SecurityQuickFixProvider implements vscode.CodeActionProvider {
    private aiEngine: AISecurityEngine;

    constructor(aiEngine: AISecurityEngine) {
        this.aiEngine = aiEngine;
    }

    provideCodeActions(): vscode.CodeAction[] {
        return [];
    }
}