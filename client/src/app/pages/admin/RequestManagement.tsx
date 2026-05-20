import { useEffect, useState } from "react";
import {
  CheckCircle, XCircle, Eye, Clock, Filter,
  BookOpen, User, Calendar, MessageSquare, Bell, Search, ArrowLeftRight
} from "lucide-react";
import { AdminTopbar } from "../../components/layout/AdminTopbar";
import { motion, AnimatePresence } from "motion/react";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  RequestItem,
  returnBookRequest,
} from "../../../api/request.api";
import { getCurrentUser } from "../../../api/client";

type FilterTab = "all" | "pending" | "approved" | "rejected" | "returned";

const statusConfig = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  approved: { label: "Approved", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  rejected: { label: "Declined", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  returned: { label: "Returned", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
};

export default function RequestManagement() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<RequestItem | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState<RequestItem | null>(null);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      showNotif("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestState = (
    id: number,
    status: "approved" | "rejected",
    remarks?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              remarks,
            }
          : r
      )
    );

    if (preview?.id === id) {
      setPreview({
        ...preview,
        status,
        remarks,
      });
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        showNotif("Admin session not found");
        return;
      }
      const adminId = currentUser.id;
      await approveRequest(id, adminId);
      updateRequestState(id, "approved");
      setPreview(null);
      showNotif(" Request approved successfully");
    } catch (err) {
      console.error(err);
      showNotif(" Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!showDeclineModal) return;
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          showNotif("Admin session not found");
          return;
        }
        const adminId = currentUser.id;
        await rejectRequest(
          showDeclineModal.id,
          adminId,
          declineNote
        );

        updateRequestState(
          showDeclineModal.id,
          "rejected",
          declineNote
        );
        setPreview(null);
        showNotif(" Request rejected");
        setShowDeclineModal(null);
        setDeclineNote("");
      } catch (err) {
        console.error(err);
        showNotif(" Failed to reject request");
      }
  };

  const handleReturn = async (user_id: number, book_id: number, requestId?: number) => {
    try {
      await returnBookRequest(user_id, book_id);

      setRequests(prev =>
        prev.map(r =>
          r.id === requestId ? { ...r, status: "returned" } : r
        )
      );

      showNotif("Book marked as returned");
    } catch (err) {
      console.error(err);
      showNotif("Failed to process return");
    }
  };

  const filtered = requests.filter(r => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.bookTitle.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts: Record<FilterTab, number> = {
  all: requests.length,
  pending: requests.filter(r => r.status === "pending").length,
  approved: requests.filter(r => r.status === "approved").length,
  rejected: requests.filter(r => r.status === "rejected").length,
  returned: requests.filter(r => r.status === "returned").length,
};
  return (
    <div>
      <AdminTopbar title="Book Requests" subtitle="Review and manage student book requests" />

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-[#0f2d5e] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <Bell className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <p style={{ fontSize: "0.85rem" }}>{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-5">
          {(["all", "pending", "approved", "rejected", "returned"] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                filter === tab
                  ? "bg-[#0f2d5e] text-white border-[#0f2d5e] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              style={{ fontSize: "0.85rem", fontWeight: filter === tab ? 600 : 400 }}
            >
              <span className="capitalize">{tab}</span>
              <span className={`rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                filter === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`} style={{ fontSize: "0.7rem" }}>
                {counts[tab]}
              </span>
            </button>
          ))}
          <div className="ml-auto relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
        </div>

        {loading && (
          <div className="mb-4 text-sm text-gray-500">
            Loading requests...
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium" style={{ fontSize: "0.8rem" }}>Student</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium" style={{ fontSize: "0.8rem" }}>Book Title</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium" style={{ fontSize: "0.8rem" }}>Request Date</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium" style={{ fontSize: "0.8rem" }}>Response Date</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium" style={{ fontSize: "0.8rem" }}>Status</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium" style={{ fontSize: "0.8rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => {
                  const status = statusConfig[req.status];
                  return (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-800" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{req.studentName}</p>
                            <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>{req.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700" style={{ fontSize: "0.875rem" }}>{req.bookTitle}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-600" style={{ fontSize: "0.85rem" }}>{req.requestDate}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600" style={{ fontSize: "0.85rem" }}>
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {req.responseDate}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full ${status.bg} ${status.text}`} style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreview(req)}
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setShowDeclineModal(req)}
                                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors"
                                title="Decline"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {req.status === "approved" && (
                            <button
                              onClick={() => handleReturn(req.user_id, req.book_id, req.id)}
                              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600"
                              title="Mark as Returned"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {req.status === "returned" && (
                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                Returned
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p style={{ fontWeight: 600 }}>No requests found</p>
              <p style={{ fontSize: "0.85rem" }}>No {filter !== "all" ? filter : ""} requests at this time</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-gray-800">Request Details</h2>
                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-800" style={{ fontWeight: 600 }}>{preview.studentName}</p>
                    <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{preview.studentId}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2.5 py-1 rounded-full ${statusConfig[preview.status].bg} ${statusConfig[preview.status].text}`} style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      {statusConfig[preview.status].label}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: BookOpen, label: "Book", value: preview.bookTitle },
                    { icon: Calendar, label: "Request Date", value: preview.requestDate },
                    { icon: Clock, label: "Scheduled Pickup", value: preview.responseDate },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>{item.label}</p>
                        <p className="text-gray-700" style={{ fontSize: "0.875rem" }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                  {preview.remarks && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>Admin Notes</p>
                        <p className="text-gray-700" style={{ fontSize: "0.875rem" }}>{preview.remarks}</p>
                      </div>
                    </div>
                  )}
                </div>
                {preview.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { handleApprove(preview.id) }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
                      style={{ fontWeight: 600, fontSize: "0.875rem" }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => { setShowDeclineModal(preview) }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
                      style={{ fontWeight: 600, fontSize: "0.875rem" }}
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decline Modal */}
      <AnimatePresence>
        {showDeclineModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-gray-800">Decline Request</h3>
              </div>
              <p className="text-gray-500 mb-4" style={{ fontSize: "0.875rem" }}>
                Declining request for <strong className="text-gray-700">{showDeclineModal.bookTitle}</strong> by {showDeclineModal.studentName}
              </p>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Reason (optional)</label>
                <textarea
                  value={declineNote}
                  onChange={e => setDeclineNote(e.target.value)}
                  placeholder="e.g. Book currently unavailable..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeclineModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: "0.875rem" }}>
                  Cancel
                </button>
                <button onClick={handleReject} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Decline Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
