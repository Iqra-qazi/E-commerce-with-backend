import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { recordCartActivity } from "../api/notifications";
import { Navbar } from "../components/Navbar";
import { formatPrice } from "../utils/formatPrice";
import { QuantitySelector } from "../components/QuantitySelector";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useProduct } from "../hooks/useProduct";

export function ProductDetailPage() {
  const { id } = useParams();
  const { product, loading, error, retry } = useProduct(id);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  async function handleAddToCart() {
    if (!product) return;
    const addedQuantity = addToCart(product, Math.min(quantity, product.stock));
    if (!user || addedQuantity === 0) return;

    try {
      await recordCartActivity(product._id, addedQuantity);
    } catch (requestError) {
      console.error("Unable to notify the admin about cart activity:", requestError);
      toast.error("Item was added to your cart, but the store could not be notified.");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <Link className="inline-flex items-center gap-2 py-4 text-sm font-medium text-stone-500 hover:text-stone-900" to="/products">
          <ArrowLeft aria-hidden="true" size={16} />
          Back to products
        </Link>

        {loading ? (
          <div className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-5 sm:grid-cols-2 sm:p-8">
            <div className="aspect-square animate-pulse rounded-2xl bg-stone-200" />
            <div className="space-y-5 py-5">
              <div className="h-4 w-1/4 animate-pulse rounded bg-stone-200" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-stone-200" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-stone-200" />
              <div className="h-20 animate-pulse rounded bg-stone-100" />
            </div>
          </div>
        ) : error || !product ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <h1 className="text-lg font-semibold text-stone-900">Unable to load this product</h1>
            <p className="mt-2 text-sm text-stone-500">{error || "Product not found."}</p>
            <button
              className="mt-5 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
              onClick={retry}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : (
          <section className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:gap-12 sm:p-8">
            <div className="overflow-hidden rounded-2xl bg-stone-100">
              {product.image ? (
                <img alt={product.name} className="aspect-square h-full w-full object-cover" src={product.image} />
              ) : (
                <div className="grid aspect-square place-items-center text-sm text-stone-400">No image available</div>
              )}
            </div>
            <div className="flex flex-col justify-center py-2 sm:py-8">
              <p className="eyebrow">{product.category || "GENERAL"}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{product.name}</h1>
              <p className="mt-5 text-2xl font-semibold text-stone-900">{formatPrice(product.price)}</p>
              <p className={`mt-4 text-sm font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
              <p className="mt-5 whitespace-pre-line leading-7 text-stone-600">
                {product.description || "A thoughtfully selected addition to your everyday."}
              </p>
              {user?.role !== "admin" ? (
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <QuantitySelector
                    max={product.stock}
                    onChange={setQuantity}
                    value={Math.min(quantity, Math.max(1, product.stock))}
                  />
                  <button
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    disabled={product.stock <= 0}
                    onClick={() => void handleAddToCart()}
                    type="button"
                  >
                    <ShoppingBag aria-hidden="true" size={17} />
                    Add to Cart
                  </button>
                </div>
              ) : (
                <p className="mt-8 text-sm font-medium text-stone-500">Cart actions are available to customer accounts.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
