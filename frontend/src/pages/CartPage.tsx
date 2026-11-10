import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { QuantitySelector } from "../components/QuantitySelector";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatPrice } from "../utils/formatPrice";

export function CartPage() {
  const { items, updateQty, removeItem, totalItems, totalPrice } = useCart();
  const { user, loading } = useAuth();

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-stone-500">Restoring your session…</div>;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="border-b border-stone-200 pb-7 pt-3">
          <p className="eyebrow">YOUR SELECTION</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">Shopping cart</h1>
          <p className="mt-2 text-sm text-stone-500">{totalItems} {totalItems === 1 ? "item" : "items"}</p>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
            <ShoppingBag aria-hidden="true" className="mx-auto text-stone-400" size={34} />
            <h2 className="mt-4 text-lg font-semibold text-stone-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-stone-500">Explore the collection and find something you love.</p>
            <Link
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-stone-700"
              to="/products"
            >
              Browse products <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <section className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white px-5">
              {items.map(({ product, quantity }) => (
                <article className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap" key={product._id}>
                  <Link className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100" to={`/products/${product._id}`}>
                    {product.image ? (
                      <img alt={product.name} className="h-full w-full object-cover" src={product.image} />
                    ) : (
                      <span className="grid h-full place-items-center text-xs text-stone-400">No image</span>
                    )}
                  </Link>
                  <div className="min-w-[140px] flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7952a7]">{product.category || "General"}</p>
                    <Link className="mt-1 block font-semibold text-stone-900 hover:text-[#7952a7]" to={`/products/${product._id}`}>
                      {product.name}
                    </Link>
                    <p className="mt-2 text-sm font-medium text-stone-700">{formatPrice(product.price)}</p>
                    {product.stock <= 0 && <p className="mt-1 text-xs font-semibold text-red-600">Currently out of stock</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <QuantitySelector
                      max={Math.max(1, product.stock)}
                      onChange={(value) => updateQty(product._id, value)}
                      value={Math.min(quantity, Math.max(1, product.stock))}
                    />
                    <button
                      aria-label={`Remove ${product.name} from cart`}
                      className="rounded-lg p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeItem(product._id)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-stone-950">Order summary</h2>
              <div className="mt-5 flex justify-between text-sm text-stone-600">
                <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="mt-3 flex justify-between text-sm text-stone-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="mt-5 flex justify-between border-t border-stone-100 pt-4 font-semibold text-stone-950">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <Link
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-700"
                to="/checkout"
              >
                Proceed to checkout <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className="mt-4 block text-center text-sm font-medium text-stone-500 hover:text-stone-900" to="/products">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
