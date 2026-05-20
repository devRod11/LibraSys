const API_URL = import.meta.env.VITE_API_URL;
import { client } from "./client";

export const getBooks = async () => {
  return await client("/api/books");
};

export const createBook = async (data: any) => {
  return await client("/api/books", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateBook = async (id: string, data: any) => {
  return await client(`/api/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteBook = async (id: string) => {
  return await client(`/api/books/${id}`, {
    method: "DELETE",
  });
};