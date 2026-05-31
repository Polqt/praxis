export interface VerifyRequest {
    taskId: string;
    code: string;
}
export interface VerifyResponse {
    verified: boolean;
    message?: string;
    feedback?: string;
    executionOutput: string;
}
