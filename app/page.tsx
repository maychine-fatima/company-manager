import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-gray-950">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <nav className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
          <div className="text-xl font-bold tracking-tight">
            Company Manager
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>

                <Link
                  href="/sign-up"
                  className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
              Finance, expenses, income & business insights
            </div>

            <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-gray-950 sm:text-6xl">
              Manage your company finances in one clean dashboard.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Track income, expenses, profit, categories, transactions, and
              export reports — built for small businesses that want clarity.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-gray-950 px-6 py-3 font-semibold text-white shadow-sm hover:bg-gray-800"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="rounded-2xl bg-gray-950 px-6 py-3 font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    Start now
                  </Link>

                  <Link
                    href="/sign-in"
                    className="rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    I already have an account
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-xl">
            <div className="rounded-[1.5rem] bg-gray-950 p-5 text-white">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today</p>
                  <h2 className="text-2xl font-bold">Financial Overview</h2>
                </div>

                <div className="rounded-full bg-white/10 px-3 py-1 text-sm">
                  Live
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-gray-300">Income</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">
                    4,250 DH
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-gray-300">Expenses</p>
                  <p className="mt-2 text-2xl font-bold text-rose-300">
                    1,180 DH
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-gray-300">Profit</p>
                  <p className="mt-2 text-2xl font-bold text-sky-300">
                    3,070 DH
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 text-gray-950">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold">Recent transactions</h3>
                  <span className="text-sm text-gray-500">Today</span>
                </div>

                <div className="space-y-3">
                  {[
                    ["Facebook Ads", "-350 DH", "text-rose-600"],
                    ["Product sale", "+650 DH", "text-emerald-600"],
                    ["Delivery", "-40 DH", "text-rose-600"],
                    ["Wholesale order", "+1,200 DH", "text-emerald-600"],
                  ].map(([title, amount, color]) => (
                    <div
                      key={title}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <span className="font-medium">{title}</span>
                      <span className={`font-bold ${color}`}>{amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
