import { client } from "./client";

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  student_id?: string;
  course?: string;
  year_level?: string;
  role?: string;
  created_at?: string;
}

/**
 * Get currently logged in user profile
 */
export const getMyProfile =
  async (): Promise<UserProfile> => {
    return await client("/api/users/me");
  };

/**
 * Update current user profile
 */
export const updateMyProfile =
  async (
    data: Partial<UserProfile>
  ) => {

    return await client(
      "/api/users/me",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

  };

  export const changeMyPassword = async (
  data: {
    oldPassword: string;
    newPassword: string;
  }
) => {

  return await client(
    "/api/users/change-password",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};