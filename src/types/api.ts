export interface User {
  name: string;
  email: string;
  role: "student" | "teacher";
  isLoggedIn: boolean; // optional, to track login state
  studyGroupId?: string; // optional, if applicable
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}
