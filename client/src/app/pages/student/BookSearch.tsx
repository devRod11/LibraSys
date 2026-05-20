import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Calendar,
  Send,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { createBookRequest } from "../../../api/request.api";
import { getBooks } from "../../../api/books.api";

interface Book {
  id: number;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  description?: string;
  published_year: number;
  book_cover_url?: string;
  copies_total: number;
  available_copies: number;
  category?: string;
}

const suggestions = [
  "Clean Code",
  "Design Patterns",
  "JavaScript",
  "Python",
  "Database",
  "Algorithms",
  "The Great Gatsby",
  "Fiction",
];

export default function BookSearch() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterAvail, setFilterAvail] = useState("All");

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [requestModal, setRequestModal] = useState<Book | null>(null);

  const [pickupDate, setPickupDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // =========================
  // FETCH BOOKS
  // =========================
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);

      const data = await getBooks();

      setBooks(data);

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to fetch books");
    } finally {
      setLoadingBooks(false);
    }
  };

  // =========================
  // FILTERS
  // =========================
  const categories = useMemo(
  () => [
    "All",
    ...Array.from(
      new Set(
        books
          .map((b) => b.category)
          .filter(Boolean)
      )
    ),
  ],
  [books]
);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const q = query.toLowerCase();

      const matchSearch =
        !query ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category?.toLowerCase().includes(q);

      const matchCategory =
        filterCat === "All" ||
        book.category === filterCat;

      const matchAvailability =
        filterAvail === "All" ||
        (filterAvail === "Available"
          ? book.available_copies > 0
          : book.available_copies === 0);

      return (
        matchSearch &&
        matchCategory &&
        matchAvailability
      );
    });
  }, [books, query, filterCat, filterAvail]);

  // =========================
  // REQUEST BOOK
  // =========================
  const handleRequest = async () => {
    if (!requestModal) return;
      if (!pickupDate) {
        setDateError("Please select a pickup date.");
        return;
      }

    const selectedDate = new Date(pickupDate);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = selectedDate.getDay();

    if (selectedDate < today) {
      setDateError(
        "Pickup date cannot be in the past."
      );
      return;
    }

    if (day === 0) {
      setDateError(
        "Pickup date must be Monday to Saturday only."
      );
      return;
    }
    try {
      setSubmitting(true);
      setDateError("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;
      await createBookRequest({
        user_id: userId,
        book_id: requestModal.id,
        pickup_date: pickupDate,
      });

      setSuccessMsg(
        `Request for "${requestModal.title}" submitted successfully`
      );

      setRequestModal(null);
      setPickupDate("");
      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);

    } catch (err: any) {
     console.error(err);

      setErrorMsg(
      err?.message ||
        "Failed to submit request"
      );

      setTimeout(() => {
        setErrorMsg("");
      }, 4000);

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            <CheckCircle className="w-4 h-4" />
            <p className="text-sm">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR TOAST */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            className="fixed top-20 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            <XCircle className="w-4 h-4" />
            <p className="text-sm">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Search Books
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Discover and request books from the library
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative mb-5">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() =>
            setTimeout(() => {
              setShowSuggestions(false);
            }, 150)
          }
          placeholder="Search books..."
          className="w-full pl-12 pr-10 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />

        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* SUGGESTIONS */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-20"
            >
              <div className="px-4 py-2 text-xs text-gray-400">
                Suggestions
              </div>

              {suggestions
                .filter((s) =>
                  s
                    .toLowerCase()
                    .includes(query.toLowerCase())
                )
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    onMouseDown={() => {
                      setQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Filter className="w-4 h-4" />
          Filters
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          {categories.map((category) => (
            <option key={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filterAvail}
          onChange={(e) =>
            setFilterAvail(e.target.value)
          }
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="All">
            All Availability
          </option>

          <option value="Available">
            Available Only
          </option>

          <option value="Unavailable">
            Unavailable
          </option>
        </select>

        <div className="ml-auto text-sm text-gray-400">
          {filteredBooks.length} result
          {filteredBooks.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* LOADING */}
      {loadingBooks && (
        <div className="text-sm text-gray-500 mb-4">
          Loading books...
        </div>
      )}

      {/* BOOK GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <motion.div
            key={book.id}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-4 flex gap-4">
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={book.book_cover_url || "/placeholder-book.png"}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {book.title}
                  </h3>

                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                      book.available_copies > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {book.available_copies > 0
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {book.author}
                </p>

                <p className="text-xs text-emerald-600 mt-1">
                  {book.category} • {book.published_year}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {book.available_copies}/{book.copies_total} copies
                  available
                </p>
              </div>
            </div>

            {book.description && (
              <p className="px-4 pb-3 text-xs text-gray-400 leading-relaxed">
                {book.description.length > 100
                  ? `${book.description.slice(
                      0,
                      100
                    )}...`
                  : book.description}
              </p>
            )}

            <div className="p-4 pt-0">
              <button
                disabled={book.available_copies === 0}
                onClick={() => {
                  setRequestModal(book);
                  setPickupDate("");
                  setDateError("");
                }}
                className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
                  book.available_copies > 0
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />

                {book.available_copies > 0
                  ? "Request Book"
                  : "Unavailable"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY */}
      {!loadingBooks &&
        filteredBooks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-200" />

            <p className="font-semibold">
              No books found
            </p>

            <p className="text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}

      {/* REQUEST MODAL */}
      <AnimatePresence>
        {requestModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  Request Book
                </h2>

                <button
                  onClick={() =>
                    setRequestModal(null)
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex gap-4 p-4 rounded-xl bg-gray-50 mb-5">
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={
                        requestModal.book_cover_url ||
                        "/placeholder-book.png"
                      }
                      alt={requestModal.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {requestModal.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {requestModal.author}
                    </p>

                    <p className="text-xs text-emerald-600 mt-2">
                      {requestModal.category}
                    </p>
                  </div>
                </div>

                {/* PICKUP DATE */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Pickup Date
                  </label>

                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        setDateError("");
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  </div>

                  {dateError && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <p className="mt-1.5 text-gray-400 text-xs">
                       Pickup dates are allowed from Monday to Saturday only.
                      </p>
                      {dateError}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() =>
                      setRequestModal(null)
                    }
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleRequest}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}

                    Send Request
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}