import { Bell, ClipboardList, Package, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminSummary, type AdminSummary } from "../api/admin";
import { getErrorMessage } from "../utils/errors";

const cards = [
  { key: "products", label: "Products", icon: Package, href: "/admin/products" },
  { key: "orders", label: "Orders", icon: ClipboardList, href: "/admin/orders" },
  { key: "users", label: "Customers", icon: Users, href: "/admin/orders" },
  { key: "unreadNotifications", label: "Unread notifications", icon: Bell, href: "/admin/notifications" },
] as const;

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await getAdminSummary());
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load dashboard statistics."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminSummary()
      .then((result) => {
        if (active) {
          setSummary(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(getErrorMessage(requestError, "Unable to load dashboard statistics."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function refreshSummary() {
    setLoading(true);
    void loadSummary();
  }

  return (
    <main>
      <header className="mb-7">
        <p className="eyebrow">STORE MANAGEMENT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Dashboard</h1>
        <p className="mt-2 text-sm text-stone-500">A current overview of your store activity.</p>
      </header>
      {error ? (
        <section className="rounded-2xl border border-red-200 bg-white p-7 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button className="mt-4 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white" onClick={refreshSummary} type="button">
            Retry
          </button>
        </section>
      ) : (
        <section aria-label="Store statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ key, label, icon: Icon, href }) => (
            <Link className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={key} to={href}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200">
                <Icon aria-hidden="true" size={19} />
              </span>
              <p className="mt-5 text-sm font-medium text-stone-500">{label}</p>
              <p className="mt-1 text-3xl font-semibold text-stone-950">
                {loading ? <span className="inline-block h-8 w-14 animate-pulse rounded bg-stone-200" /> : summary?.[key] ?? 0}
              </p>
            </Link>
          ))}
        </section>
      )}
      <section className="mt-7 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-pink-50 p-6 dark:border-violet-300/10 dark:from-violet-950/30 dark:to-pink-950/20">
        <h2 className="font-semibold text-stone-900">Order management</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          Review incoming orders, update fulfillment status, and keep up with cart and order notifications.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white" to="/admin/orders">View orders</Link>
          <Link className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 dark:border-violet-300/20 dark:bg-white/5 dark:text-violet-200" to="/admin/notifications">Open notifications</Link>
        </div>
      </section>
    </main>
  );
}
