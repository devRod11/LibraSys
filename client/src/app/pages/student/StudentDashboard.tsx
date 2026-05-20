import { BookOpen, Clock, CheckCircle, AlertTriangle, Calendar, BookMarked, ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getStudentDashboard,
  StudentBorrowedBook,
  StudentRequest,
} from "../../../api/dashboard.api";
import { useAppContext } from "../../context/AppContext";
import {
  useEffect,
  useState,
} from "react";
import { motion } from "motion/react";
import { socket } from "../../../socket"; 

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [myBorrowed,setMyBorrowed] = useState<StudentBorrowedBook[]>([]);
  const [myRequests,setMyRequests] = useState<StudentRequest[]>([]);
  const [loading,setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboard();

    socket.on(
      "studentDashboardUpdated",
      () => {
        fetchDashboard();
      }
    );

    socket.on("booksUpdated", () => {
      fetchDashboard();
    });

    return () => {
      socket.off(
        "studentDashboardUpdated"
      );

      socket.off("booksUpdated");
    };
  }, []);

  const fetchDashboard =
    async () => {

      try {

        setLoading(true);

        const data =
          await getStudentDashboard();

        setMyBorrowed(
          data.borrowed || []
        );

        setMyRequests(
          data.requests || []
        );

      } catch (err) {

        console.error(
          "Dashboard Error:",
          err
        );

      } finally {

        setLoading(false);

      }
    };
  const overdue = myBorrowed.filter(b => b.status === "overdue");
  const active = myBorrowed.filter(b => b.status === "active");

  const statusConfig = {
    active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
    overdue: { bg: "bg-red-100", text: "text-red-700", label: "Overdue" },
    returned: { bg: "bg-gray-100", text: "text-gray-600", label: "Returned" },
  };

  const reqStatus = {
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
    approved: { bg: "bg-green-100", text: "text-green-700" },
    rejected: { bg: "bg-red-100", text: "text-red-700" },
  };

  if (loading) {

  return (

    <div className="p-6 flex items-center justify-center min-h-[60vh]">

      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />

    </div>

  );
}

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#065f46] to-[#047857] rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-12 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-emerald-200 mb-1" style={{ fontSize: "0.875rem" }}>Welcome back,</p>
          <h1 className="text-white mb-2" style={{ fontSize: "1.5rem" }}>{user?.name}</h1>
          <p className="text-emerald-100 mb-4" style={{ fontSize: "0.875rem" }}>
            You currently have <strong>{active.length} borrowed book{active.length !== 1 ? "s" : ""}</strong>. 
            {overdue.length > 0 && <span className="text-yellow-200"> ⚠️ {overdue.length} overdue!</span>}
          </p>
          <button
            onClick={() => navigate("/student/search")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl px-4 py-2 transition-all"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            <BookOpen className="w-4 h-4" />
            Browse Books
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Borrowed Books", value: myBorrowed.length, icon: BookMarked, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Active Borrows", value: active.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          { label: "Overdue", value: overdue.length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
          { label: "Pending Requests", value: myRequests.filter(r => r.status === "pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white rounded-xl p-5 border ${card.border} shadow-sm`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-gray-800" style={{ fontSize: "1.75rem", fontWeight: 700 }}>{card.value}</p>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: "0.8rem" }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Borrowed Books */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">My Borrowed Books</h3>
            <button onClick={() => navigate("/student/search")} className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1" style={{ fontSize: "0.8rem" }}>
              Search more <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {myBorrowed.map(book => {
              const s = statusConfig[book.status];
              const isOverdue = book.status === "overdue";
              return (
                <div key={book.id} className={`p-4 rounded-xl border ${isOverdue ? "border-red-100 bg-red-50/50" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 truncate" style={{ fontSize: "0.875rem", fontWeight: 600 }}>{book.title}</p>
                      <p className="text-gray-500" style={{ fontSize: "0.78rem" }}>{book.author}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-gray-400" style={{ fontSize: "0.72rem" }}>
                          <Calendar className="w-3 h-3" />
                          Borrowed: {book.borrow_date}
                        </div>
                        <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-gray-400"}`} style={{ fontSize: "0.72rem", fontWeight: isOverdue ? 600 : 400 }}>
                          <Clock className="w-3 h-3" />
                          Due: {book.due_date}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${s.bg} ${s.text} flex-shrink-0`} style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </div>
                  {isOverdue && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-600" style={{ fontSize: "0.72rem" }}>
                      <AlertTriangle className="w-3 h-3" />
                      This book is overdue! Please return it as soon as possible.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">My Recent Requests</h3>
            <button onClick={() => navigate("/student/requests")} className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1" style={{ fontSize: "0.8rem" }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p style={{ fontWeight: 600 }}>No requests yet</p>
              <p style={{ fontSize: "0.8rem" }}>Browse books and send a request</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.slice(0, 4).map(req => {
                const s = reqStatus[req.status];
                return (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{req.book_title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {/* Progress indicator */}
                        <div className="flex items-center gap-1">
                          {["Submitted", "Reviewed", req.status === "approved" ? "Approved" : req.status === "rejected" ? "Rejected" : "Pending"].map((step, i) => (
                            <div key={step} className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                i === 0 ? "bg-green-500" :
                                i === 1 && req.status !== "pending" ? "bg-green-500" :
                                i === 2 && req.status === "approved" ? "bg-green-500" :
                                i === 2 && req.status === "rejected" ? "bg-red-500" :
                                "bg-gray-300"
                              }`} />
                              {i < 2 && <div className={`w-3 h-0.5 ${i === 0 || (i === 1 && req.status !== "pending") ? "bg-green-400" : "bg-gray-200"}`} />}
                            </div>
                          ))}
                        </div>
                        <span className="text-gray-400" style={{ fontSize: "0.68rem" }}>{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${s.bg} ${s.text} flex-shrink-0 capitalize`} style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => navigate("/student/requests")}
            className="w-full mt-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            style={{ fontSize: "0.85rem" }}
          >
            <BookOpen className="w-4 h-4" />
            Request a New Book
          </button>
        </div>
      </div>

      {/* Due date reminders */}
      {overdue.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Overdue Book Reminder</p>
            <p className="text-red-600 mt-1" style={{ fontSize: "0.8rem" }}>
              You have {overdue.length} overdue book(s). Please return them to avoid penalties.
              Overdue books: {overdue.map(b => `"${b.title}"`).join(", ")}.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
