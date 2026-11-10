import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

export function Navbar() {
  const { logout, user } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link className="brand-mark" to="/">
        atelier<span>.</span>
      </Link>
      <nav className="flex items-center gap-3 sm:gap-5">
        <Link
          className="hidden text-sm font-semibold text-stone-600 transition hover:text-[#7952a7] dark:text-stone-300 sm:inline"
          to="/products"
        >
          Products
        </Link>
        {user?.role === "admin" && (
          <Link
            className="text-sm font-semibold text-stone-600 transition hover:text-[#7952a7] dark:text-stone-300"
            to="/admin"
          >
            Admin
          </Link>
        )}
        {user && user.role !== "admin" && (
          <Link
            className="hidden text-sm font-semibold text-stone-600 transition hover:text-[#7952a7] dark:text-stone-300 sm:inline"
            to="/my-orders"
          >
            My orders
          </Link>
        )}
        <ThemeToggle />
        {user?.role !== "admin" && (
          <Link
            aria-label={`Shopping cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
            className="relative grid h-10 w-10 place-items-center rounded-xl text-stone-600 transition hover:bg-[#f3edfa] hover:text-[#7952a7] dark:text-stone-300 dark:hover:bg-white/10"
            to="/cart"
          >
            <ShoppingCart aria-hidden="true" size={19} />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-[#8055ad] to-[#bd7da9] px-1 text-[10px] font-bold text-white">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          </Link>
        )}
        {user ? (
          <button
            className="text-sm font-semibold text-stone-600 transition hover:text-[#7952a7] dark:text-stone-300"
            onClick={logout}
            type="button"
          >
            Sign out
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold text-stone-600 hover:text-[#7952a7] dark:text-stone-300" to="/login">
              Sign in
            </Link>
            <Link className="hidden rounded-lg bg-gradient-to-r from-[#8055ad] to-[#a56fc0] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-900/15 transition hover:brightness-105 sm:inline" to="/signup">
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
