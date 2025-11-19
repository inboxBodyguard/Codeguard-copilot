import { AISecurityEngine } from '../ai/aiEngine';
import { SecurityPattern } from './vulnerabilityPatterns';
export interface Vulnerability {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    line: number;
    column: number;
    length: number;
    message: string;
    explanation: string;
    fix: string;
    codeExample?: string;
    cwe?: string;
}
export declare class SecurityScanner {
    private patterns;
    private aiEngine;
    constructor(aiEngine: AISecurityEngine);
    scan(code: string, language: string): Promise<Vulnerability[]>;
    private patternScan;
    private shouldRunAIAnalysis;
    private deduplicateAndPrioritize;
    addCustomPattern(pattern: SecurityPattern): void;
    getPatterns(): SecurityPattern[];
}
//# sourceMappingURL=securityScanner.d.ts.map