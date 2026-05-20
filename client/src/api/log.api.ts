import { client } from "./client";


export interface NotificationItem {
    id: number;
    action: string;
    description: string;
    created_at: string;
    is_read: boolean;
    user_id?: number;
    book_id?: number;
    request_id?: number;
    full_name?: string;
    book_title?: string;
}

export const getAllLogs = async (): Promise<NotificationItem[]> => {
    return await client("/api/logs");
};

export const getLogsByUser = async (
  userId: number
): Promise<NotificationItem[]> => {
  return await client(`/api/logs/user/${userId}`);
};

export const markNotificationRead = async (
  id: number
) => {
  return await client(`/api/logs/${id}/read`, {
    method: "PUT",
  });
};

export const markAllNotificationsRead = async () => {

  return await client("/api/logs/read-all", {
    method: "PUT",
  });
};