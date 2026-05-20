import { client } from "./client";

export interface DashboardStats {
  totalBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  pendingRequests: number;
}

export interface BorrowTrend {
  day: string;
  borrows: number;
  returns: number;
}

export interface CategoryItem {
  name: string;
  value: number;
}

export interface TopBorrowedBook {
  title: string;
  count: number;
}

export interface ActiveUser {
  name: string;
  borrows: number;
  id: string;
}

export const getDashboardStats = async () => {
  return await client("/api/dashboard/stats");
};

export const getBorrowTrends = async () => {
  return await client("/api/dashboard/borrow-trends");
};

export const getCategoryDistribution = async () => {
  return await client("/api/dashboard/categories");
};

export const getTopBorrowedBooks = async () => {
  return await client("/api/dashboard/top-books");
};

export const getActiveUsers = async () => {
  return await client("/api/dashboard/active-users");
};

export interface StudentBorrowedBook {
  id: number;
  book_id: number;

  title: string;
  author: string;

  borrow_date: string;
  due_date: string;

  return_date?: string;

  status:
    | "active"
    | "overdue"
    | "returned";
}

export interface StudentRequest {
  id: number;

  book_title: string;

  status:
    | "pending"
    | "approved"
    | "rejected";

  created_at: string;
}

export interface StudentDashboardData {
  borrowed: StudentBorrowedBook[];
  requests: StudentRequest[];
}

export const getStudentDashboard =
  async (): Promise<StudentDashboardData> => {

    return await client(
      "/api/dashboard/student"
    );

  };