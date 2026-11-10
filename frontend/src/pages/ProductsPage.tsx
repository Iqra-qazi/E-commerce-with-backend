import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { ProductGrid } from "../components/ProductGrid";
import { Skeleton } from "../components/Skeleton";
import { useProducts } from "../hooks/useProducts";

type SortOrder = "newest" | "price-low" | "price-high";

export function ProductsPage() {
  const { products, loading, error, retry } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category?.trim()).filter((value): value is string => Boolean(value)))].sort(),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);
      const matchesCategory = category === "all" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "price-low") return a.price - b.price;
      if (sortOrder === "price-high") return b.price - a.price;
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  }, [products, search, category, sortOrder]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="border-b border-stone-200 pb-7 pt-3">
          <p className="eyebrow">THE COLLECTION</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">All products</h1>
          <p className="mt-2 text-sm text-stone-500">Find your next everyday favourite.</p>
        </div>

        <div className="my-6 grid gap-3 sm:grid-cols-[1fr_200px_200px]">
          <label className="input-shell flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5">
            <Search aria-hidden="true" className="text-stone-400" size={17} />
            <input
              aria-label="Search products"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or categories"
              type="search"
              value={search}
            />
          </label>
          <select
            aria-label="Filter by category"
            className="h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-700 outline-none focus:border-[#b65f3c]"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            aria-label="Sort products"
            className="h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-700 outline-none focus:border-[#b65f3c]"
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            value={sortOrder}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        {loading ? (
          <Skeleton count={8} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-medium text-stone-900">We couldn’t load the products.</p>
            <p className="mt-2 text-sm text-stone-500">{error}</p>
            <button
              className="mt-5 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
              onClick={retry}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : visibleProducts.length ? (
          <>
            <p className="mb-4 text-sm text-stone-500">{visibleProducts.length} products</p>
            <ProductGrid products={visibleProducts} />
          </>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center">
            <h2 className="font-semibold text-stone-900">No products found</h2>
            <p className="mt-2 text-sm text-stone-500">Try another search or category.</p>
          </div>
        )}
      </main>
    </div>
  );
}
