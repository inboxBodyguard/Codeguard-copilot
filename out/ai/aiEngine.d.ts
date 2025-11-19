import { Vulnerability } from '../patterns/securityScanner';
export declare class AISecurityEngine {
    private apiKey;
    private provider;
    private apiEndpoint;
    constructor();
    private getApiEndpoint;
    analyzeCode(code: string, language: string, existingVulns: Vulnerability[]): Promise<Vulnerability[]>;
    private buildSecurityPrompt;
    private callAI;
    private callClaude;
    private callGroq;
    private callOpenAI;
    private parseAIResponse;
    private normalizeSeverity;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=aiEngine.d.ts.map