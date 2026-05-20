import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  BookOpen,
  Lock,
  CheckCircle,
  Edit3,
  Save,
  X,
  Clock,
  Loader2,
} from "lucide-react";

import { useEffect, useState, } from "react";
import { motion } from "motion/react";
import { useAppContext } from "../../context/AppContext";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../../../api/user.api";
import { getAllRequests, } from "../../../api/request.api";

export default function Profile() {

  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false); const [requests, setRequests] = useState<any[]>([]);
  const [borrowedBooks] = useState<any[]>([]);
  const [form, setForm] =
    useState({
      full_name: "",
      email: "",
      phone: "",
      student_id: "",
      course: "",
      year_level: "",
      created_at: "",
    });

  const [showPasswordModal,
  setShowPasswordModal] =
  useState(false);

const [passwordForm,
  setPasswordForm] =
  useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

const [passwordLoading,
  setPasswordLoading] =
  useState(false);

const [passwordError,
  setPasswordError] =
  useState("");

const [passwordSuccess,
  setPasswordSuccess] =
  useState("");

  const [editForm, setEditForm] =
    useState({
      ...form,
    });

  useEffect(() => {

    fetchProfile();

  }, []);

  const fetchProfile =
    async () => {

      try {

        setLoading(true);

        const profileData =
          await getMyProfile();

        const requestsData =
          await getAllRequests();

        const myRequests =
          requestsData.filter(
            (r: any) =>
              r.user_id ===
              profileData.id
          );

        setRequests(myRequests);

        const profile = {
          full_name:
            profileData.full_name ||
            user?.name ||
            "",

          email:
            profileData.email ||
            "",

          phone:
            profileData.phone ||
            "",

          student_id:
            profileData.student_id ||
            "",

          course:
            profileData.course ||
            "",

          year_level:
            profileData.year_level ||
            "",

          created_at:
            profileData.created_at ||
            "",
        };

        setForm(profile);
        setEditForm(profile);

      } catch (err) {

        console.error(
          "Profile Fetch Error:",
          err
        );

      } finally {

        setLoading(false);

      }
    };

    const profileFields = [
          {
            icon: User,
            label: "Full Name",
            key: "full_name",
          },

          {
            icon: Mail,
            label: "Email",
            key: "email",
          },

          {
            icon: Phone,
            label: "Phone",
            key: "phone",
          },

          {
            icon: Shield,
            label: "Student ID",
            key: "student_id",
          },

          {
            icon: BookOpen,
            label: "Course",
            key: "course",
          },

          {
            icon: Calendar,
            label: "Year Level",
            key: "year_level",
          },
        ];

  const handleSave =
    async () => {

      try {

        await updateMyProfile(
          editForm
        );

        setForm(editForm);

        setEditing(false);

        setSaved(true);

        setTimeout(() => {

          setSaved(false);

        }, 3000);

      } catch (err) {

        console.error(
          "Profile Update Error:",
          err
        );

      }
    };

    const handleChangePassword =
  async () => {

    try {

      setPasswordError("");
      setPasswordSuccess("");

      if (
        !passwordForm.oldPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setPasswordError(
          "All fields are required"
        );
        return;
      }

      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setPasswordError(
          "Passwords do not match"
        );
        return;
      }

      if (
        passwordForm.newPassword.length < 6
      ) {
        setPasswordError(
          "Password must be at least 6 characters"
        );
        return;
      }

      setPasswordLoading(true);

      await changeMyPassword({
        oldPassword:
          passwordForm.oldPassword,
        newPassword:
          passwordForm.newPassword,
      });

      setPasswordSuccess(
        "Password changed successfully"
      );

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {

        setShowPasswordModal(false);

        setPasswordSuccess("");

      }, 1500);

    } catch (err: any) {

      setPasswordError(
        err.message ||
        "Failed to change password"
      );

    } finally {

      setPasswordLoading(false);

    }
  };

  if (loading) {

    return (

      <div className="p-6 flex items-center justify-center min-h-[60vh]">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />

          <p
            className="text-gray-500"
            style={{
              fontSize: "0.875rem",
            }}
          >
            Loading profile...
          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="p-6 space-y-5">

      {saved && (

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2"
        >

          <CheckCircle className="w-4 h-4 text-green-600" />

          <p
            className="text-green-700"
            style={{
              fontSize: "0.85rem",
            }}
          >
            Profile updated successfully!
          </p>

        </motion.div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#065f46] to-[#047857] rounded-2xl p-6 text-white relative overflow-hidden">

        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />

        <div className="flex items-center gap-5 relative z-10">

          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">

            <span
              className="text-white"
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              {form.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>

          </div>

          <div className="flex-1">

            <h2
              className="text-white"
              style={{
                fontSize: "1.25rem",
              }}
            >
              {form.full_name}
            </h2>

            <p
              className="text-emerald-200"
              style={{
                fontSize: "0.85rem",
              }}
            >
              {form.student_id}
            </p>

            <p
              className="text-emerald-300 mt-0.5"
              style={{
                fontSize: "0.78rem",
              }}
            >
              {form.course}
            </p>

          </div>

          <button
            onClick={() => {

              setEditing(
                !editing
              );

              setEditForm({
                ...form,
              });

            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl px-3 py-2 transition-all"
            style={{
              fontSize: "0.8rem",
            }}
          >

            <Edit3 className="w-3.5 h-3.5" />

            {editing
              ? "Cancel"
              : "Edit Profile"}

          </button>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Personal Info */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">

          <h3 className="text-gray-800 mb-4">
            Personal Information
          </h3>

          <div className="space-y-3">

            {profileFields.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0"
              >

                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">

                  <item.icon className="w-4 h-4 text-gray-500" />

                </div>

                <div className="flex-1">

                  <p
                    className="text-gray-400"
                    style={{
                      fontSize: "0.72rem",
                    }}
                  >
                    {item.label}
                  </p>

                  {editing ? (

                    <input
                      value={
                        editForm[
                          item.key as keyof typeof editForm
                        ] || ""
                      }
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [item.key]: e.target.value,
                        }))
                      }
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />

                  ) : (

                    <p
                      className="text-gray-700"
                      style={{
                        fontSize: "0.875rem",
                      }}
                    >
                      {
                        form[
                          item.key as keyof typeof form
                        ] || "-"
                      }
                    </p>

                  )}

                </div>

              </div>

            ))}

            {editing && (

              <div className="flex gap-3 pt-3">

                <button
                  onClick={() =>
                    setEditing(
                      false
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >

                  <X className="w-4 h-4" />

                  Cancel

                </button>

                <button
                  onClick={
                    handleSave
                  }
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2"
                >

                  <Save className="w-4 h-4" />

                  Save

                </button>

              </div>

            )}

          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

            <h3 className="text-gray-800 mb-3">
              Library Activity
            </h3>

            <div className="space-y-3">

              {[
                {
                  label:
                    "Borrowed Books",
                  value:
                    borrowedBooks.length,
                  color:
                    "text-blue-600",
                  bg:
                    "bg-blue-50",
                },

                {
                  label:
                    "Requests",
                  value:
                    requests.length,
                  color:
                    "text-amber-600",
                  bg:
                    "bg-amber-50",
                },
              ].map((stat) => (

                <div
                  key={stat.label}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50"
                >

                  <span
                    className="text-gray-600"
                    style={{
                      fontSize:
                        "0.825rem",
                    }}
                  >
                    {stat.label}
                  </span>

                  <span
                    className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}
                    style={{
                      fontSize:
                        "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {stat.value}
                  </span>

                </div>
              ))}

            </div>

          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

            <h3 className="text-gray-800 mb-3">
              Account Security
            </h3>

            <div className="space-y-3">

              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">

                <CheckCircle className="w-4 h-4 text-green-600" />

                <div>

                  <p
                    className="text-green-800"
                    style={{
                      fontSize:
                        "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    Verified Student
                  </p>

                  <p
                    className="text-green-600"
                    style={{
                      fontSize:
                        "0.7rem",
                    }}
                  >
                    Your account is secured
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">

                <Clock className="w-4 h-4 text-gray-400" />

                <div>

                  <p
                    className="text-gray-600"
                    style={{
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    Member Since
                  </p>

                  <p
                    className="text-gray-400"
                    style={{
                      fontSize:
                        "0.7rem",
                    }}
                  >
                    {form.created_at
                      ? new Date(
                          form.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              <button
              onClick={ () => setShowPasswordModal(true) }
              className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPasswordModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
        >

          <div className="flex items-center justify-between mb-5">

            <h3 className="text-lg font-semibold text-gray-800">
              Change Password
            </h3>

            <button
              onClick={() =>
                setShowPasswordModal(false)
              }
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

          <div className="space-y-4">

            <div>

              <label className="text-sm text-gray-600">
                Old Password
              </label>

              <input
                type="password"
                value={
                  passwordForm.oldPassword
                }
                onChange={(e) =>
                  setPasswordForm(prev => ({
                    ...prev,
                    oldPassword:
                      e.target.value,
                  }))
                }
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2"
              />

            </div>

            <div>

              <label className="text-sm text-gray-600">
                New Password
              </label>

              <input
                type="password"
                value={
                  passwordForm.newPassword
                }
                onChange={(e) =>
                  setPasswordForm(prev => ({
                    ...prev,
                    newPassword:
                      e.target.value,
                  }))
                }
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2"
              />

            </div>

            <div>

              <label className="text-sm text-gray-600">
                Confirm New Password
              </label>

              <input
                type="password"
                value={
                  passwordForm.confirmPassword
                }
                onChange={(e) =>
                  setPasswordForm(prev => ({
                    ...prev,
                    confirmPassword:
                      e.target.value,
                  }))
                }
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2"
              />

            </div>

            {passwordError && (

              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">

                {passwordError}

              </div>
            )}

            {passwordSuccess && (

              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-600">

                {passwordSuccess}

              </div>
            )}

            <button
              onClick={
                handleChangePassword
              }
              disabled={passwordLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-3 flex items-center justify-center gap-2"
            >

              {passwordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}

              Update Password

            </button>

          </div>

        </motion.div>

      </div>
    )}
    </div>
  );
}