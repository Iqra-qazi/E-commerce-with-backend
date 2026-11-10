export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

export type CurrentUserResponse = {
  user: AuthUser;
};
