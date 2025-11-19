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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const securityScanner_1 = require("./patterns/securityScanner");
const aiEngine_1 = require("./ai/aiEngine");
const diagnostics_1 = require("./ui/diagnostics");
const quickFix_1 = require("./ui/quickFix");
let diagnosticCollection;
let securityScanner;
let aiEngine;
let scanTimeout;
function activate(context) {
    console.log('🛡️ Security Co-pilot is now active!');
    // Initialize core components
    diagnosticCollection = vscode.languages.createDiagnosticCollection('security');
    context.subscriptions.push(diagnosticCollection);
    aiEngine = new aiEngine_1.AISecurityEngine();
    securityScanner = new securityScanner_1.SecurityScanner(aiEngine);
    // Command: Scan current file
    const scanFileCommand = vscode.commands.registerCommand('securityCopilot.scanFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await scanDocument(editor.document);
            vscode.window.showInformationMessage('✅ Security scan complete!');
        }
        else {
            vscode.window.showWarningMessage('No active file to scan');
        }
    });
    // Command: Scan entire workspace
    const scanWorkspaceCommand = vscode.commands.registerCommand('securityCopilot.scanWorkspace', async () => {
        const files = await vscode.workspace.findFiles('**/*.{js,ts,py,java,php}');
        let scanned = 0;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Scanning workspace for vulnerabilities...',
            cancellable: true
        }, async (progress, token) => {
            for (const file of files) {
                if (token.isCancellationRequested)
                    break;
                const doc = await vscode.workspace.openTextDocument(file);
                await scanDocument(doc);
                scanned++;
                progress.report({
                    message: `${scanned}/${files.length} files`,
                    increment: (100 / files.length)
                });
            }
        });
        vscode.window.showInformationMessage(`✅ Scanned ${scanned} files. Check Problems panel for results.`);
    });
    // Real-time scanning on document change
    const changeListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
        const config = vscode.workspace.getConfiguration('securityCopilot');
        const enableRealtime = config.get('enableRealtime', true);
        if (!enableRealtime)
            return;
        // Debounce typing
        if (scanTimeout)
            clearTimeout(scanTimeout);
        const delay = config.get('scanDelay', 500);
        scanTimeout = setTimeout(async () => {
            await scanDocument(event.document);
        }, delay);
    });
    // Scan on save
    const saveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
        await scanDocument(document);
    });
    // Register quick-fix provider
    const quickFixProvider = vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, new quickFix_1.SecurityQuickFixProvider(aiEngine), {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    });
    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(shield) Security Co-pilot';
    statusBarItem.tooltip = 'Click to scan current file';
    statusBarItem.command = 'securityCopilot.scanFile';
    statusBarItem.show();
    context.subscriptions.push(scanFileCommand, scanWorkspaceCommand, changeListener, saveListener, quickFixProvider, statusBarItem);
}
async function scanDocument(document) {
    console.log('🔍 Scanning document:', document.fileName, 'Language:', document.languageId);
    // Supported languages
    const supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'php'];
    if (!supportedLanguages.includes(document.languageId)) {
        console.log('⏭️ Skipping unsupported language:', document.languageId);
        return;
    }
    try {
        const vulnerabilities = await securityScanner.scan(document.getText(), document.languageId);
        console.log(`✅ Found ${vulnerabilities.length} vulnerabilities`);
        const diagnostics = diagnostics_1.SecurityDiagnostics.createDiagnostics(document, vulnerabilities);
        diagnosticCollection.set(document.uri, diagnostics);
    }
    catch (error) {
        console.error('❌ Scan failed:', error);
    }
}
function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
//# sourceMappingURL=extension.js.map