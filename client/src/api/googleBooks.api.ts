import axios from "axios";

const API_KEY =
  import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export const fetchBookByISBN = async (
  isbn: string
) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`
    );

    const items = response.data.items;

    if (!items || items.length === 0) {
      throw new Error("Book not found");
    }

    const volumeInfo = items[0].volumeInfo;

    return {
      title: volumeInfo.title || "",
      author:
        volumeInfo.authors?.join(", ") || "",
      publisher:
        volumeInfo.publisher || "",
      year:
        Number(
          volumeInfo.publishedDate?.split("-")[0]
        ) || new Date().getFullYear(),
      description:
        volumeInfo.description || "",
      cover:
        volumeInfo.imageLinks?.thumbnail || "",
      category:
        volumeInfo.categories?.[0] ||
        "Other",
    };

  } catch (err: any) {
    console.error(err);

    if (err.response?.status === 429) {
      throw new Error(
        "Google Books API quota exceeded."
      );
    }

    throw new Error(
      err.response?.data?.error?.message ||
      "Failed to fetch book"
    );
  }
};