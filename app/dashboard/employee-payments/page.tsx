"use client";

import { useEffect, useState } from "react";

type EmployeePayment = {
  id: string;
  employeeName: string;
  amount: number;
  paymentDate: string;
  note?: string;
};

export default function EmployeePaymentsPage() {
  const [payments, setPayments] = useState<EmployeePayment[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    employeeName: "",
    amount: "",
    paymentDate: "",
    note: "",
  });

  const fetchPayments = async () => {
    const res = await fetch("/api/employee-payments");
    const data = await res.json();
    setPayments(data);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("/api/employee-payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeName: form.employeeName,
        amount: Number(form.amount),
        paymentDate: form.paymentDate || undefined,
        note: form.note,
      }),
    });

    setForm({
      employeeName: "",
      amount: "",
      paymentDate: "",
      note: "",
    });

    setIsOpen(false);
    fetchPayments();
  };

  const deletePayment = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee payment?",
    );

    if (!confirmed) return;

    await fetch(`/api/employee-payments?id=${id}`, {
      method: "DELETE",
    });

    fetchPayments();
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-950">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Finance</p>
          <h1 className="text-3xl font-bold">Employee Payments</h1>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          + Add Payment
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total paid</p>
          <h2 className="mt-2 text-3xl font-bold text-rose-600">
            {totalPaid} DH
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Payments count</p>
          <h2 className="mt-2 text-3xl font-bold">{payments.length}</h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Category</p>
          <h2 className="mt-2 text-xl font-bold">Employee Payments</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left font-semibold">Employee</th>
              <th className="p-4 text-left font-semibold">Amount</th>
              <th className="p-4 text-left font-semibold">Date</th>
              <th className="p-4 text-left font-semibold">Note</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No employee payments yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">{payment.employeeName}</td>

                  <td className="p-4 font-semibold text-rose-600">
                    {payment.amount} DH
                  </td>

                  <td className="p-4">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-gray-600">{payment.note || "-"}</td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => deletePayment(payment.id)}
                      className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Add Employee Payment</h2>
            <p className="mt-1 text-sm text-gray-500">
              This will also be added automatically as an expense.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                required
                placeholder="Employee name"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={form.employeeName}
                onChange={(e) =>
                  setForm({ ...form, employeeName: e.target.value })
                }
              />

              <input
                required
                type="number"
                placeholder="Amount"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />

              <input
                type="date"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={form.paymentDate}
                onChange={(e) =>
                  setForm({ ...form, paymentDate: e.target.value })
                }
              />

              <textarea
                placeholder="Note optional"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gray-950 px-4 py-2 font-semibold text-white hover:bg-gray-800"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
