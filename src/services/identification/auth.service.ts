import { http } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/api/Endpoints";
import type {
  UserProfile,
  ForgotPasswordRequest,
  VerifyResetTokenRequest,
  VerifyResetTokenResponse,
  ResetPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "@/api/types";

// Tipo interno — o browser nunca recebe os tokens JWT
type LoginResult = { user: UserProfile | null };
type GoogleLoginResult = { user: UserProfile | null; isNewUser: boolean };

export const authService = {
  // Chama a rota server-side que define os cookies HttpOnly
  async login(data: LoginRequest): Promise<LoginResult> {
    return http.post<LoginResult>("/api/auth/login", data);
  },

  // Chama a rota server-side que troca o idToken do Google e define os cookies HttpOnly
  async loginWithGoogle(idToken: string): Promise<GoogleLoginResult> {
    return http.post<GoogleLoginResult>("/api/auth/google", { idToken });
  },

  // Chama a rota server-side que revoga o token e apaga os cookies
  async logout(): Promise<void> {
    await http.post("/api/auth/logout");
  },

  register(data: RegisterRequest): Promise<RegisterResponse> {
    return http.post<RegisterResponse>(API_ENDPOINTS.auth.register.url, data);
  },

  verifyEmail(data: VerifyEmailRequest): Promise<void> {
    return http.post<void>(API_ENDPOINTS.auth.verifyEmail.url, data);
  },

  resendVerificationCode(data: ResendVerificationRequest): Promise<void> {
    return http.post<void>(API_ENDPOINTS.auth.resendVerification.url, data);
  },

  forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return http.post<void>(API_ENDPOINTS.auth.forgotPassword.url, data);
  },

  verifyResetToken(data: VerifyResetTokenRequest): Promise<VerifyResetTokenResponse> {
    return http.post<VerifyResetTokenResponse>(API_ENDPOINTS.auth.verifyResetToken.url, data);
  },

  resetPassword(data: ResetPasswordRequest): Promise<void> {
    return http.post<void>(API_ENDPOINTS.auth.resetPassword.url, data);
  },
};
