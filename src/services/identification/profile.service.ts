import { http } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/api/Endpoints";
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "@/api/types";

export const profileService = {
  getMe(): Promise<UserProfile> {
    return http.get<UserProfile>(API_ENDPOINTS.me.getProfile.url);
  },

  updateMe(data: UpdateProfileRequest): Promise<UserProfile> {
    return http.patch<UserProfile>(API_ENDPOINTS.me.updateProfile.url, data);
  },

  changePassword(data: ChangePasswordRequest): Promise<void> {
    return http.post<void>(API_ENDPOINTS.me.changePassword.url, data);
  },

  toggleMfa(enabled: boolean): Promise<{ mfa: boolean }> {
    return http.patch<{ mfa: boolean }>(API_ENDPOINTS.me.toggleMfa.url, { enabled });
  },
};
