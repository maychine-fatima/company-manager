"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [sortBy, setSortBy] = useState<"date" | "amount" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    date: "",
  });

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category))).filter(
      Boolean,
    );
  }, [transactions]);

  const filtered = useMemo(() => {
    const result = transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || t.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });

    result.sort((a, b) => {
      let first: string | number = "";
      let second: string | number = "";

      if (sortBy === "date") {
        first = new Date(a.date).getTime();
        second = new Date(b.date).getTime();
      }

      if (sortBy === "amount") {
        first = a.amount;
        second = b.amount;
      }

      if (sortBy === "title") {
        first = a.title.toLowerCase();
        second = b.title.toLowerCase();
      }

      if (first < second) return sortOrder === "asc" ? -1 : 1;

      if (first > second) return sortOrder === "asc" ? 1 : -1;

      return 0;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const exportToExcel = () => {
    const cleanData = filtered.map((t) => ({
      Title: t.title,
      Amount: t.amount,
      Type: t.type,
      Category: t.category,
      Date: new Date(t.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(cleanData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "transactions.xlsx");
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTransaction.title,
        amount: Number(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date || undefined,
      }),
    });

    setNewTransaction({
      title: "",
      amount: "",
      type: "expense",
      category: "",
      date: "",
    });

    setIsAddOpen(false);

    fetchTransactions();
  };

  const updateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTransaction) return;

    await fetch("/api/transactions", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingTransaction),
    });

    setIsEditOpen(false);
    setEditingTransaction(null);

    fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    const confirmed = window.confirm("Delete this transaction?");

    if (!confirmed) return;

    await fetch(`/api/transactions?id=${id}`, {
      method: "DELETE",
    });

    fetchTransactions();
  };

  return (
    <div className="max-w-7xl mx-auto text-gray-950">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Finance</p>

          <h1 className="text-3xl font-bold">Transactions</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            + Add Transaction
          </button>

          <button
            onClick={exportToExcel}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            placeholder="Search..."
            className="md:col-span-2 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="rounded-xl border border-gray-200 px-3 py-2"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="rounded-xl border border-gray-200 px-3 py-2"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "amount" | "title")
              }
            >
              <option value="date">Sort by date</option>

              <option value="amount">Sort by amount</option>

              <option value="title">Sort by title</option>
            </select>

            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="rounded-xl border border-gray-200 px-3"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left font-semibold">Title</th>

              <th className="p-4 text-left font-semibold">Amount</th>

              <th className="p-4 text-left font-semibold">Type</th>

              <th className="p-4 text-left font-semibold">Category</th>

              <th className="p-4 text-left font-semibold">Date</th>

              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((t) => (
              <tr
                key={t.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{t.title}</td>

                <td
                  className={`p-4 font-semibold ${
                    t.type === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {t.amount} DH
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      t.type === "income"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {t.type}
                  </span>
                </td>

                <td className="p-4">{t.category}</td>

                <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>

                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingTransaction(t);
                        setIsEditOpen(true);
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-700 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-gray-200 px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-xl px-3 py-2 ${
                currentPage === page
                  ? "bg-gray-950 text-white"
                  : "border border-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-xl border border-gray-200 px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Add Transaction</h2>

            <form onSubmit={addTransaction} className="mt-5 space-y-3">
              <input
                required
                placeholder="Title"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={newTransaction.title}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    title: e.target.value,
                  })
                }
              />

              <input
                required
                type="number"
                placeholder="Amount"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
              />

              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={newTransaction.type}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    type: e.target.value,
                  })
                }
              >
                <option value="income">Income</option>

                <option value="expense">Expense</option>
              </select>

              <input
                required
                placeholder="Category"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    date: e.target.value,
                  })
                }
              />

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gray-950 px-4 py-2 font-semibold text-white hover:bg-gray-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Edit Transaction</h2>

            <form onSubmit={updateTransaction} className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={editingTransaction.title}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    title: e.target.value,
                  })
                }
              />

              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={editingTransaction.amount}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    amount: Number(e.target.value),
                  })
                }
              />

              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={editingTransaction.type}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    type: e.target.value as "income" | "expense",
                  })
                }
              >
                <option value="income">Income</option>

                <option value="expense">Expense</option>
              </select>

              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={editingTransaction.category}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    category: e.target.value,
                  })
                }
              />

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gray-950 px-4 py-2 font-semibold text-white hover:bg-gray-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
