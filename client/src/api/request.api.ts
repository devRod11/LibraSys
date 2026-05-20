import { client } from "./client";

export interface RequestItem {
  id: number;
  user_id: number;
  book_id: number;

  studentName: string;
  studentId: string;

  bookTitle: string;

  requestDate: string;
  responseDate?: string;

  status: "pending" | "approved" | "rejected" | "returned";

  remarks?: string;
}

export const createBookRequest = async ({
  user_id,
  book_id,
  pickup_date,
}: {
  user_id: number;
  book_id: number;
  pickup_date: string;
}) => {
  return await client("/api/requests", {
    method: "POST",
    body: JSON.stringify({
      user_id,
      book_id,
      pickup_date,
    }),
  });
};

export const getAllRequests = async (): Promise<RequestItem[]> => {
  const data = await client("/api/requests");

  return data.map((req: any) => ({
    id: req.id,
    user_id: req.user_id,
    book_id: req.book_id,

    studentName: req.full_name,
    studentId: String(req.user_id),

    bookTitle: req.title,

    requestDate: new Date(
      req.request_date
    ).toLocaleDateString(),

    responseDate: req.response_date
      ? new Date(req.response_date).toLocaleDateString()
      : undefined,

    // convert declined -> rejected for frontend
    status:
      req.status === "declined"
        ? "rejected"
        : req.status,

    remarks: req.remarks,
  }));
};

export const approveRequest = async (
  requestId: number,
  adminId: number
) => {
  return await client(
    `/api/requests/${requestId}/approve`,
    {
      method: "PUT",
      body: JSON.stringify({
        admin_id: adminId,
      }),
    }
  );
};

export const rejectRequest = async (
  requestId: number,
  adminId: number,
  remarks: string
) => {
  return await client(
    `/api/requests/${requestId}/reject`,
    {
      method: "PUT",
      body: JSON.stringify({
        admin_id: adminId,
        remarks,
      }),
    }
  );
};

export const deleteRequest = async (
  requestId: number
) => {
  return await client(
    `/api/requests/${requestId}`,
    {
      method: "DELETE",
    }
  );
};

export const returnBookRequest = async (
  user_id: number,
  book_id: number
) => {
  return await client("/api/requests/return", {
    method: "POST",
    body: JSON.stringify({
      user_id,
      book_id,
    }),
  });
};