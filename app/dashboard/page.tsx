"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState("today");
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
  });

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount),
      }),
    });

    setIsOpen(false);
    setForm({ title: "", amount: "", type: "expense", category: "" });
    fetchTransactions();
  };

  // FILTER LOGIC
  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.date);

    if (filter === "today") {
      return date.toDateString() === new Date().toDateString();
    }

    if (filter === "month") {
      return (
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()
      );
    }

    return true;
  });

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const profit = income - expenses;

  // CHART DATA
  const chartData = filteredTransactions.map((t, i) => ({
    name: i,
    income: t.type === "income" ? t.amount : 0,
    expense: t.type === "expense" ? t.amount : 0,
  }));

  const categoryData = Object.values(
    filteredTransactions.reduce((acc: any, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { name: t.category, value: 0 };
      }
      acc[t.category].value += t.amount;
      return acc;
    }, {}),
  );

  return (
    <div className="max-w-6xl mx-auto text-gray-900 ">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-xl"
        >
          + Add Transaction
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 ">
        {["today", "month", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded  ${
              filter === f
                ? "bg-black text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow border border-gray-200">
          <p className="text-gray-600">Income</p>
          <h2 className="text-2xl font-bold text-green-600">{income} DH</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow border border-gray-200">
          <p className="text-gray-600">Expenses</p>
          <h2 className="text-2xl font-bold text-red-600">{expenses} DH</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow border border-gray-200">
          <p className="text-gray-600">Profit</p>
          <h2 className="text-2xl font-bold text-blue-600">{profit} DH</h2>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="income" stroke="#16a34a" />
            <Line dataKey="expense" stroke="#dc2626" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CATEGORY PIE */}
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[400px]">
            <h2 className="text-xl font-bold mb-4">Add Transaction</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="border p-2 w-full rounded"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <input
                className="border p-2 w-full rounded"
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />

              <select
                className="border p-2 w-full rounded"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <input
                className="border p-2 w-full rounded"
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />

              <button className="bg-black text-white w-full p-2 rounded">
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
