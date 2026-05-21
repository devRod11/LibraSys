"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooks = void 0;
const API_URL = process.env.API_URL || "http://localhost:3001/api";
const getBooks = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/books`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch books");
    }
    return res.json();
};
exports.getBooks = getBooks;
