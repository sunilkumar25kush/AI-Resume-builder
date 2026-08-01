import { apiClient } from "./client";
import type {
  ApiEnvelope,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  User,
} from "@/types";

interface UserPayload {
  user: User;
}

export const authApi = {
  async register(data: RegisterInput): Promise<User> {
    const res = await apiClient.post<ApiEnvelope<UserPayload>>("/auth/register", data);
    return res.data.data.user;
  },

  async login(data: LoginInput): Promise<User> {
    const res = await apiClient.post<ApiEnvelope<UserPayload>>("/auth/login", data);
    return res.data.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>("/auth/logout");
  },

  async me(): Promise<User> {
    const res = await apiClient.get<ApiEnvelope<UserPayload>>("/auth/me");
    return res.data.data.user;
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<{ devResetToken?: string }> {
    const res = await apiClient.post<ApiEnvelope<{ devResetToken?: string }>>("/auth/forgot-password", data);
    return res.data.data;
  },

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>("/auth/reset-password", data);
  },

  async googleLogin(credential: string): Promise<User> {
    const res = await apiClient.post<ApiEnvelope<UserPayload>>("/auth/google", { credential });
    return res.data.data.user;
  },

  async updateProfile(data: { name: string }): Promise<User> {
    const res = await apiClient.patch<ApiEnvelope<UserPayload>>("/users/me", data);
    return res.data.data.user;
  },

  async uploadAvatar(file: File): Promise<User> {
    const form = new FormData();
    form.append("avatar", file);
    const res = await apiClient.patch<ApiEnvelope<UserPayload>>("/users/me/avatar", form);
    return res.data.data.user;
  },
};
