import { client } from "./client";

export const bulkUploadStudents =
  async (
    formData: FormData
  ) => {

    const token =
      localStorage.getItem(
        "token"
      );

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/students/bulk-upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data =
      await res.json();

    if (!res.ok) {
      throw new Error(
        data.message ||
        "Upload failed"
      );
    }

    return data;
  };

export const getStudents = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/admin/students`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch students");
  }

  return data;
};

export const deleteStudent = async (id: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/admin/students/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete student");
  }

  return data;
};
