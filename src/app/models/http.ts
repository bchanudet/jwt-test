export interface ConnectionPayload{
    username: string;
    password: string;
}

export interface TokenResult {
    success: boolean;
    token: string;
}

export interface UserResult {
  id: string;
  name: string;
  email: string;
  job_title: string;
  created_at: string;
  updated_at: string;
}
