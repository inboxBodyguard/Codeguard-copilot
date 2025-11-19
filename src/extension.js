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
exports.activate = activate;
exports.deactivate = deactivate;
var vscode = require("vscode");
var securityScanner_1 = require("./patterns/securityScanner");
var aiEngine_1 = require("./ai/aiEngine");
var diagnostics_1 = require("./ui/diagnostics");
var quickFix_1 = require("./ui/quickFix");
var diagnosticCollection;
var securityScanner;
var aiEngine;
var scanTimeout;
function activate(context) {
    var _this = this;
    console.log('🛡️ Security Co-pilot is now active!');
    // Initialize core components
    diagnosticCollection = vscode.languages.createDiagnosticCollection('security');
    context.subscriptions.push(diagnosticCollection);
    aiEngine = new aiEngine_1.AISecurityEngine();
    securityScanner = new securityScanner_1.SecurityScanner(aiEngine);
    // Command: Scan current file
    var scanFileCommand = vscode.commands.registerCommand('securityCopilot.scanFile', function () { return __awaiter(_this, void 0, void 0, function () {
        var editor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    editor = vscode.window.activeTextEditor;
                    if (!editor) return [3 /*break*/, 2];
                    return [4 /*yield*/, scanDocument(editor.document)];
                case 1:
                    _a.sent();
                    vscode.window.showInformationMessage('✅ Security scan complete!');
                    return [3 /*break*/, 3];
                case 2:
                    vscode.window.showWarningMessage('No active file to scan');
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Command: Scan entire workspace
    var scanWorkspaceCommand = vscode.commands.registerCommand('securityCopilot.scanWorkspace', function () { return __awaiter(_this, void 0, void 0, function () {
        var files, scanned;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.workspace.findFiles('**/*.{js,ts,py,java,php}')];
                case 1:
                    files = _a.sent();
                    scanned = 0;
                    return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: 'Scanning workspace for vulnerabilities...',
                            cancellable: true
                        }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, files_1, file, doc;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _i = 0, files_1 = files;
                                        _a.label = 1;
                                    case 1:
                                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                                        file = files_1[_i];
                                        if (token.isCancellationRequested)
                                            return [3 /*break*/, 5];
                                        return [4 /*yield*/, vscode.workspace.openTextDocument(file)];
                                    case 2:
                                        doc = _a.sent();
                                        return [4 /*yield*/, scanDocument(doc)];
                                    case 3:
                                        _a.sent();
                                        scanned++;
                                        progress.report({
                                            message: "".concat(scanned, "/").concat(files.length, " files"),
                                            increment: (100 / files.length)
                                        });
                                        _a.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    vscode.window.showInformationMessage("\u2705 Scanned ".concat(scanned, " files. Check Problems panel for results."));
                    return [2 /*return*/];
            }
        });
    }); });
    // Real-time scanning on document change
    var changeListener = vscode.workspace.onDidChangeTextDocument(function (event) { return __awaiter(_this, void 0, void 0, function () {
        var config, enableRealtime, delay;
        var _this = this;
        return __generator(this, function (_a) {
            config = vscode.workspace.getConfiguration('securityCopilot');
            enableRealtime = config.get('enableRealtime', true);
            if (!enableRealtime)
                return [2 /*return*/];
            // Debounce: wait for user to stop typing
            if (scanTimeout) {
                clearTimeout(scanTimeout);
            }
            delay = config.get('scanDelay', 500);
            scanTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, scanDocument(event.document)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }, delay);
            return [2 /*return*/];
        });
    }); });
    // Scan on save
    var saveListener = vscode.workspace.onDidSaveTextDocument(function (document) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, scanDocument(document)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Register quick fix provider
    var quickFixProvider = vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, new quickFix_1.SecurityQuickFixProvider(aiEngine), {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    });
    // Status bar item
    var statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(shield) Security Co-pilot';
    statusBarItem.tooltip = 'Click to scan current file';
    statusBarItem.command = 'securityCopilot.scanFile';
    statusBarItem.show();
    context.subscriptions.push(scanFileCommand, scanWorkspaceCommand, changeListener, saveListener, quickFixProvider, statusBarItem);
}
function scanDocument(document) {
    return __awaiter(this, void 0, void 0, function () {
        var supportedLanguages, vulnerabilities, diagnostics, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'php'];
                    if (!supportedLanguages.includes(document.languageId)) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, securityScanner.scan(document.getText(), document.languageId)];
                case 2:
                    vulnerabilities = _a.sent();
                    diagnostics = diagnostics_1.SecurityDiagnostics.createDiagnostics(document, vulnerabilities);
                    diagnosticCollection.set(document.uri, diagnostics);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Scan failed:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
