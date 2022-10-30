export interface ConnectionPayload{
    username: string;
    password: string;
}

export interface TokenResult {
    success: boolean;
    token: string;
}

export interface DataResult{
    test: boolean;
    time: Date;
    data: string;
}