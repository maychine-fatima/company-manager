import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-950">
      <aside className="hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-gray-100 bg-white p-6 md:flex">
        <div className="min-h-0">
          <h2 className="mb-8 text-2xl font-bold text-gray-950">
            Company Manager
          </h2>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block rounded-xl px-4 py-2 text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
            >
              📊 Dashboard
            </Link>

            <Link
              href="/dashboard/transactions"
              className="block rounded-xl px-4 py-2 text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
            >
              📋 Transactions
            </Link>

            <Link
              href="/dashboard/employee-payments"
              className="block rounded-xl px-4 py-2 text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
            >
              👥 Employee Payments
            </Link>

            <Link
              href="/dashboard/settings"
              className="block rounded-xl px-4 py-2 text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
            >
              ⚙️ Settings
            </Link>
          </nav>
        </div>

        <div className="shrink-0 border-t border-gray-100 pt-4">
          <p className="mb-1 text-xs font-medium text-gray-400">Signed in as</p>

          <p className="mb-4 truncate text-sm font-semibold text-gray-800">
            {user?.email}
          </p>

          <form action="/sign-out" method="post">
            <button
              type="submit"
              className="w-full rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="h-screen flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
