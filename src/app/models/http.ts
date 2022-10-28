export interface ConnectionPayload{
    username: string;
    password: string;
}

export interface TokenResult {
    success: boolean;
    token: string;
}
