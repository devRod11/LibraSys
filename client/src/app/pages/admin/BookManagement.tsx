import { useState } from "react";
import {
  Plus, Search, Edit2, Trash2, BookOpen, X, Save,
  Download, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Eye
} from "lucide-react";
import { AdminTopbar } from "../../components/layout/AdminTopbar";
import { Book, BookForm, BookPayload } from "../../data/mockData";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "../../../api/books.api";
import { fetchBookByISBN, } from "../../../api/googleBooks.api";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { socket } from "../../../socket";

const CATEGORIES = ["Computer Science", "Fiction", "Software Engineering", "Mathematics", "Other"];

const emptyBook: BookForm = {
  isbn: "",
  title: "",
  author: "",
  category: "Computer Science",
  year: 2024,
  copies: 1,
  available: 1,
  cover: "",
  description: "",
  publisher: "",
};

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(emptyBook);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [dupWarning, setDupWarning] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  const filtered = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search);
    const matchCat = filterCat === "All" || b.category === filterCat;
    return matchSearch && matchCat;
  });

  useEffect(() => {
    fetchBooks();
    }, []);

    const fetchBooks = async () => {
      try {
        const data = await getBooks();

        setBooks(data);
      } catch (err) {
        console.error(err);
      }
    };

  const BOOK_COVER_KEYWORDS = [
    "programming book",
    "computer science book",
    "software engineering book",
    "library book",
    "mathematics book",
    "coding book",
    "technology book",
    "academic book",
    "study book",
    "education book",
  ];

  const generateBookCover = () => {
    const keyword =
    BOOK_COVER_KEYWORDS[
      Math.floor(
        Math.random() *
        BOOK_COVER_KEYWORDS.length
      )
    ];

  const seed =
    `${keyword}-${Date.now()}-${Math.random()}`;

  return `https://loremflickr.com/300/450/book?lock=${Date.now()}`;                                                                                                                                                                                                                                                                                                               };

  const openAdd = () => {
    setEditBook(null);

    setForm({
      ...emptyBook,

      // auto generate unique book cover
      cover: generateBookCover(),
    });

    setFetchSuccess(false);
    setDupWarning(false);
    setShowModal(true);
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    const { id, ...rest } = book;
    setForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      category: book.category,

      year: book.published_year,
      copies: book.copies_total,
      available: book.available_copies,

      cover: book.book_cover_url,
      description: book.description,            
      publisher: book.publisher,
    });
    setFetchSuccess(false);
    setDupWarning(false);
    setShowModal(true);
  };

  const handleFetchAPI = async () => {
    if (fetchLoading) return;
    if (!form.isbn) return;

    const isDup =
      books.some(
        (b) =>
          b.isbn === form.isbn &&
          (
            !editBook ||
            b.id !== editBook.id
          )
      );

    if (isDup) {
      setDupWarning(true);
      return;
    }

      try {
    setDupWarning(false);

    setFetchLoading(true);

    const cleanISBN = form.isbn
      .replace(/-/g, "")
      .replace(/\s/g, "");

    const data =
      await fetchBookByISBN(cleanISBN);

    setForm((f) => ({
      ...f,
      ...data,
    }));

    setFetchSuccess(true);

  } catch (err: any) {

    alert(
      err.message ||
      "Failed to fetch book"
    );

  } finally {

    setFetchLoading(false);

  }
  };
  const handleIsbnChange = (val: string) => {
    setForm(f => ({ ...f, isbn: val }));
    setDupWarning(false);
    setFetchSuccess(false);
    const isDup = books.some(b => b.isbn === val && (!editBook || b.id !== editBook.id));
    if (isDup && val) setDupWarning(true);
  };

  const mapFormToPayload = (
    form: BookForm
  ): BookPayload => {
    return {
      isbn: form.isbn,
      title: form.title,
      author: form.author,
      category: form.category,

      published_year: form.year,
      copies_total: form.copies,

      book_cover_url: form.cover,
      description: form.description,
      publisher: form.publisher,
    };
  };

  const handleSave = async () => {
    try {
      const payload = mapFormToPayload(form);

      if (editBook) {
        await updateBook(editBook.id, payload);
      } else {
        await createBook(payload);
      }

      await fetchBooks();

      setShowModal(false);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
  try {
    await deleteBook(id);

    await fetchBooks();

    setDeleteConfirm(null);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div>
      <AdminTopbar title="Book Management" subtitle="Add, edit and manage the library catalog" />
      <div className="p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, ISBN..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 shadow-sm"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            style={{ fontSize: "0.875rem" }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#0f2d5e] hover:bg-[#1a3f7a] text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            style={{ fontSize: "0.875rem", fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
            Showing <strong className="text-gray-700">{filtered.length}</strong> of <strong className="text-gray-700">{books.length}</strong> books
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>{books.filter(b => b.available_copies > 0).length} available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>{books.filter(b => b.available_copies === 0).length} unavailable</span>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(book => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-4"
            >
              <div className="flex gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={book.book_cover_url} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-gray-800 truncate" style={{ fontSize: "0.9rem" }}>{book.title}</h4>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs ${book.available_copies > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                      {book.available_copies > 0 ? "Available" : "Out"}
                    </span>
                  </div>
                  <p className="text-gray-500 truncate" style={{ fontSize: "0.75rem" }}>{book.author}</p>
                  <p className="text-blue-600 mt-1" style={{ fontSize: "0.7rem" }}>{book.category}</p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem", }}> Code: {book.book_code}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-gray-400" style={{ fontSize: "0.7rem" }}>ISBN: {book.isbn}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${ book.copies_total > 0 ? (book.available_copies / book.copies_total) * 100 : 0 }%` }} />
                      </div>
                      <span className="text-gray-400" style={{ fontSize: "0.68rem" }}>{book.available_copies}/{book.copies_total}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => setPreviewBook(book)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => openEdit(book)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(book.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p style={{ fontWeight: 600 }}>No books found</p>
              <p style={{ fontSize: "0.85rem" }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-gray-800">{editBook ? "Edit Book" : "Add New Book"}</h2>
                  <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.8rem" }}>
                    {editBook ? "Update book information" : "Fill in the book details or fetch from API"}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* ISBN + API Fetch */}
                <div>
                  <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>ISBN</label>
                  <div className="flex gap-2">
                    <input
                      value={form.isbn}
                      onChange={e => handleIsbnChange(e.target.value)}
                      placeholder="e.g. 978-0-13-468599-1"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      style={{ fontSize: "0.875rem" }}
                    />
                    <button
                      type="button"
                      onClick={handleFetchAPI}
                      disabled={fetchLoading || !form.isbn}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
                      style={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      {fetchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Fetch Book Info (API)
                    </button>
                  </div>
                  {dupWarning && (
                    <div className="mt-2 flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <p style={{ fontSize: "0.75rem" }}>Duplicate detected! A book with this ISBN already exists.</p>
                    </div>
                  )}
                  {fetchSuccess && (
                    <div className="mt-2 flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <p style={{ fontSize: "0.75rem" }}>Book data fetched successfully from Google Books API!</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Title *</label>
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Book title"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      style={{ fontSize: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Author *</label>
                    <input
                      value={form.author}
                      onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                      placeholder="Author name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      style={{ fontSize: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Publisher</label>
                    <input
                      value={form.publisher}
                      onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))}
                      placeholder="Publisher name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      style={{ fontSize: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Year</label>
                    <input
                      type="number"
                      value={form.year}
                      onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      style={{ fontSize: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Total Copies</label>
                    <input
                      type="number"
                      value={form.copies}
                      onChange={e => setForm(f => ({ ...f, copies: Number(e.target.value), })) }
                      min={1}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      style={{ fontSize: "0.875rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the book"
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1.5" style={{ fontSize: "0.85rem" }}>Cover Image URL</label>
                  <div className="flex gap-3">
                    <input
                      value={form.cover}
                      onChange={e => setForm(f => ({ ...f, cover: e.target.value }))}
                      placeholder="Image URL from API"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      style={{ fontSize: "0.875rem" }}
                    />
                    {form.cover && (
                      <div className="w-12 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={form.cover} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  style={{ fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.title || !form.isbn}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f2d5e] hover:bg-[#1a3f7a] text-white transition-colors disabled:opacity-60"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  <Save className="w-4 h-4" />
                  {editBook ? "Update Book" : "Add Book"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-gray-800">Delete Book?</h3>
              </div>
              <p className="text-gray-500 mb-5" style={{ fontSize: "0.875rem" }}>
                This action cannot be undone. The book will be permanently removed from the catalog.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  style={{ fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBook && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewBook(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={previewBook.book_cover_url} alt={previewBook.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-gray-800">{previewBook.title}</h2>
                  <p className="text-gray-600 mt-1" style={{ fontSize: "0.85rem" }}>{previewBook.author}</p>
                  <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.75rem" }}>
                    {previewBook.category}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-gray-600" style={{ fontSize: "0.85rem" }}>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">ISBN</span>
                  <span>{previewBook.isbn}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Publisher</span>
                  <span>{previewBook.publisher}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Year</span>
                  <span>{previewBook.published_year}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Availability</span>
                  <span className={previewBook.available_copies > 0 ? "text-green-600" : "text-red-600"}>
                    {previewBook.available_copies}/{previewBook.copies_total} copies
                  </span>
                </div>
                {previewBook.description && (
                  <p className="text-gray-500 pt-1" style={{ fontSize: "0.8rem" }}>{previewBook.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewBook(null)}
                className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                style={{ fontSize: "0.875rem" }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
