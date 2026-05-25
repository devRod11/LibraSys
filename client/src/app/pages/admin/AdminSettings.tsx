import {Upload,FileSpreadsheet,Loader2,CheckCircle,AlertCircle,Trash2,} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  bulkUploadStudents,
  getStudents,
  deleteStudent,
} from "../../../api/admin.api";

type Student = {
  id: number;
  full_name: string;
  email: string;
  student_id: string;
  created_at: string;
};

export default function AdminSettings() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [fetchingStudents, setFetchingStudents] =
    useState(false);

  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);

      const data = await getStudents();

      setStudents(data.students);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to fetch students"
      );
    } finally {
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleFile = (selected: File) => {
    if (selected.type !== "text/csv") {
      setError(
        "Only CSV files are allowed"
      );
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      setError("");

      setSuccess("");

      const formData = new FormData();

      formData.append("file", file);

      const res =
        await bulkUploadStudents(
          formData
        );

      setSuccess(
        `${res.inserted} students imported successfully`
      );

      setFile(null);

      fetchStudents();
    } catch (err: any) {
      setError(
        err.message ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student account?"
    );

    if (!confirmDelete) return;

    try {
      await deleteStudent(id);

      setStudents((prev) =>
        prev.filter(
          (student) =>
            student.id !== id
        )
      );

      setSuccess(
        "Student account deleted successfully"
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to delete account"
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-gray-800 text-lg font-semibold">
            Bulk Student Upload
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Upload multiple student accounts using CSV.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() =>
            setDragging(false)
          }
          onDrop={(e) => {
            e.preventDefault();

            setDragging(false);

            const dropped =
              e.dataTransfer.files[0];

            if (dropped)
              handleFile(dropped);
          }}
          onClick={() =>
            inputRef.current?.click()
          }
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:border-emerald-300"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={(e) => {
              const selected =
                e.target.files?.[0];

              if (selected)
                handleFile(selected);
            }}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Upload className="w-7 h-7 text-emerald-600" />
            </div>

            <div>
              <p className="text-gray-700 font-medium">
                Drag & Drop CSV File
              </p>

              <p className="text-gray-400 text-sm mt-1">
                or click to browse
              </p>
            </div>
          </div>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />

            <div className="flex-1 min-w-0">
              <p className="text-gray-700 text-sm truncate">
                {file.name}
              </p>

              <p className="text-gray-400 text-xs">
                {(file.size / 1024).toFixed(
                  2
                )}{" "}
                KB
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
            <CheckCircle className="w-4 h-4 text-green-600" />

            <p className="text-green-700 text-sm">
              {success}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-600" />

            <p className="text-red-700 text-sm">
              {error}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}

          Upload Students
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-gray-800 text-lg font-semibold">
            Delete Student Accounts
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Manage and delete student accounts.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 text-sm font-semibold text-gray-600">
                  Full Name
                </th>

                <th className="text-left p-3 text-sm font-semibold text-gray-600">
                  Email
                </th>

                <th className="text-left p-3 text-sm font-semibold text-gray-600">
                  Student Number
                </th>

                <th className="text-left p-3 text-sm font-semibold text-gray-600">
                  Date Created
                </th>

                <th className="text-right p-3 text-sm font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {fetchingStudents ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t border-gray-100"
                  >
                    <td className="p-3 text-sm text-gray-700">
                      {student.full_name}
                    </td>

                    <td className="p-3 text-sm text-gray-700">
                      {student.email}
                    </td>

                    <td className="p-3 text-sm text-gray-700">
                      {student.student_id}
                    </td>

                    <td className="p-3 text-sm text-gray-700">
                      {new Date(
                        student.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() =>
                          handleDelete(
                            student.id
                          )
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />

                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
