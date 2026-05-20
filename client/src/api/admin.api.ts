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