import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Send,
  X,
  Plus,
  Loader2,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import { useNavigate } from "react-router";

import {
  getAllRequests,
  createBookRequest,
  deleteRequest,
  RequestItem,
} from "../../../api/request.api";

import { getBooks } from "../../../api/books.api";

type Status = "pending" | "approved" | "rejected";

interface Book {
  id: number;
  title: string;
  author: string;
  copies_available: number;
}

const statusConfig: Record<
  Status,
  {
    bg: string;
    text: string;
    dot: string;
    label: string;
  }
> = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Pending",
  },

  approved: {
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Approved",
  },

  rejected: {
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Rejected",
  },
};

export default function MyRequests() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | Status
  >("all");

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [reqForm, setReqForm] = useState({
    bookId: "",
    pickupDate: "",
  });

  const [dateError, setDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelConfirm, setCancelConfirm] =
    useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [notification, setNotification] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchRequests();
    fetchBooks();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const data = await getAllRequests();

      const myRequests = data.filter(
        (r) => r.user_id === userId
      );

      setRequests(myRequests);

    } catch (err) {
      console.error(err);

      setErrorMsg("Failed to fetch requests");

    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const data = await getBooks();

      setBooks(data);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // FILTERS
  // =========================
  const filteredRequests = useMemo(() => {
    return requests.filter(
      (r) =>
        filterStatus === "all" ||
        r.status === filterStatus
    );
  }, [requests, filterStatus]);

  const counts = {
    all: requests.length,

    pending: requests.filter(
      (r) => r.status === "pending"
    ).length,

    approved: requests.filter(
      (r) => r.status === "approved"
    ).length,

    rejected: requests.filter(
      (r) => r.status === "rejected"
    ).length,
  };

  // =========================
  // CREATE REQUEST
  // =========================
  const handleSubmit = async () => {
    if (!reqForm.bookId || !reqForm.pickupDate) {
      setDateError("Please fill in all fields.");
      return;
    }

    const selectedDate = new Date(reqForm.pickupDate);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setDateError(
        "Pickup date must be in the future."
      );
      return;
    }

    const day = selectedDate.getDay();

    if (day === 0) {
      setDateError(
        "Pickup date must be Monday to Saturday only."
      );
      return;
    }

    try {
      setSubmitting(true);

      await createBookRequest({
        user_id: userId,
        book_id: Number(reqForm.bookId),
        pickup_date: reqForm.pickupDate,
      });

      setSuccessMsg(
        "Book request submitted successfully"
      );

      setShowRequestModal(false);

      setReqForm({
        bookId: "",
        pickupDate: "",
      });

      fetchRequests();

      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);

    } catch (err: any) {
      console.error(err);
      showNotif("Failed to submit request");
      setTimeout(() => {
        setErrorMsg("");
      }, 4000);

    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // CANCEL REQUEST
  // =========================
  const handleCancel = async (
    requestId: number
    ) => {
      try {
        await deleteRequest(requestId);
        setRequests((prev) =>
          prev.filter((r) => r.id !== requestId)
        );
        setCancelConfirm(null);
        setSuccessMsg(
          "Request cancelled successfully"
        );
        setTimeout(() => {
          setSuccessMsg("");
        }, 4000);

      } catch (err) {
        console.error(err);
        setErrorMsg(
          "Failed to cancel request"
        );
        setTimeout(() => {
          setErrorMsg("");
        }, 4000);
      }
    };

  return (
    <div className="p-6">
      {/* SUCCESS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            <CheckCircle className="w-4 h-4" />

            <p className="text-sm">
              {successMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            className="fixed top-20 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            <XCircle className="w-4 h-4" />

            <p className="text-sm">
              {errorMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            My Requests
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Track your book requests
          </p>
        </div>

        <button
          onClick={() => {
            setShowRequestModal(true);

            setReqForm({
              bookId: "",
              pickupDate: "",
            });

            setDateError("");
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          style={{ fontSize: "0.875rem", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          New Request
      </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(
          [
            "all",
            "pending",
            "approved",
            "rejected",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setFilterStatus(tab)
            }
            className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
              filterStatus === tab
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <span className="capitalize">
              {tab}
            </span>

            <span className="ml-2 text-xs">
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-500">
          Loading requests...
        </div>
      )}

      {/* REQUESTS */}
      <div className="space-y-4">
        {filteredRequests.map((req) => {
          const s =
            statusConfig[
              req.status as Status
            ];

          return (
            <motion.div
              key={req.id}
              layout
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {req.bookTitle}
                    </h3>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Requested:
                        {req.requestDate}
                      </div>

                      {req.responseDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Responded:
                          {req.responseDate}
                        </div>
                      )}
                    </div>

                    {req.remarks && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-2 text-xs text-gray-500 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5" />

                        {req.remarks}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${s.bg} ${s.text}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                    />

                    {s.label}
                  </span>

                  {req.status ===
                    "pending" && (
                    <button
                      onClick={() =>
                        setCancelConfirm(
                          req.id
                        )
                      }
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* EMPTY */}
      {!loading &&
        filteredRequests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-200" />

            <p className="font-semibold text-gray-700">
              No requests found
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Start by requesting a book
            </p>

            <button
              onClick={() =>
                navigate(
                  "/student/search"
                )
              }
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-4 h-4" />
              Browse Books
            </button>
          </div>
        )}

      {/* MODAL */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              initial={{
                scale: 0.95,
                y: 20,
              }}
              animate={{
                scale: 1,
                y: 0,
              }}
              exit={{
                scale: 0.95,
                y: 20,
              }}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  New Request
                </h2>

                <button
                  onClick={() =>
                    setShowRequestModal(
                      false
                    )
                  }
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Select Book
                  </label>

                  <select
                    value={
                      reqForm.bookId
                    }
                    onChange={(e) =>
                      setReqForm(
                        (
                          prev
                        ) => ({
                          ...prev,
                          bookId:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50"
                  >
                    <option value="">
                      Select a book
                    </option>

                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Pickup Date
                  </label>

                  <input
                    type="date"
                    value={reqForm.pickupDate}
                    onChange={(e) => {
                      setReqForm((f) => ({
                        ...f,
                        pickupDate: e.target.value,
                      }));

                      setDateError("");
                    }}
                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    style={{ fontSize: "0.875rem" }}
                  />

                  {dateError && (
                    <p className="text-xs text-red-600 mt-2">
                      {dateError}
                    </p>
                  )}
                  <p className="mt-1.5 text-gray-400" style={{ fontSize: "0.72rem" }}>
                    ℹ️ Pickup dates are allowed from Monday to Saturday only.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() =>
                      setShowRequestModal(
                        false
                      )
                    }
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      submitting
                    }
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}

                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCEL CONFIRM */}
      <AnimatePresence>
        {cancelConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              initial={{
                scale: 0.95,
              }}
              animate={{
                scale: 1,
              }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Cancel Request?
              </h3>

              <p className="text-sm text-gray-500 mb-5">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setCancelConfirm(
                      null
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600"
                >
                  Keep
                </button>

                <button
                  onClick={() =>
                    handleCancel(
                      cancelConfirm
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                >
                  Cancel Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}