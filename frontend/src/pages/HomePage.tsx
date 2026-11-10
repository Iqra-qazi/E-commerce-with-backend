import { ArrowRight, Heart, Sparkles, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { ProductGrid } from "../components/ProductGrid";
import { Skeleton } from "../components/Skeleton";
import { useProducts } from "../hooks/useProducts";

export function HomePage() {
  const { products, loading, error, retry } = useProducts();

  return (
    <div className="home-page min-h-screen bg-[#fbfaff] text-[#27213a]">
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-3 sm:px-6 sm:pt-5">
          <div className="home-hero relative isolate overflow-hidden rounded-[2rem] border border-[#eee8fb] px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-[4.5rem]">
            <div aria-hidden="true" className="home-hero-orb home-hero-orb-one" />
            <div aria-hidden="true" className="home-hero-orb home-hero-orb-two" />
            <div aria-hidden="true" className="home-hero-orb home-hero-orb-three" />
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#e7dcfa] bg-white/75 px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#7952a7] shadow-sm shadow-violet-900/5">
                  <Sparkles aria-hidden="true" className="text-[#a16cce]" size={15} />
                  Thoughtfully selected
                </p>
                <h1 className="home-heading mt-6 text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.055em] text-[#302642] sm:text-6xl lg:text-[4.4rem]">
                  Find something
                  <br />
                  <span className="home-gradient-text">to love.</span>
                </h1>
                <p className="mt-6 max-w-lg text-[0.98rem] leading-7 text-[#6d647d] sm:text-lg sm:leading-8">
                  Discover useful, beautiful finds chosen to bring a little more joy to everyday life.
                </p>
                <Link
                  className="home-primary-button mt-8 inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9563c8]"
                  to="/products"
                >
                  Explore the collection
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#817791]">
                  <span className="inline-flex items-center gap-1.5">
                    <Heart aria-hidden="true" className="text-[#d884a7]" size={14} />
                    Thoughtful finds
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-[#c4b8d5] sm:inline-block" />
                  <span>Made for everyday</span>
                </div>
              </div>

              <div aria-hidden="true" className="relative mx-auto hidden h-[18rem] w-full max-w-[25rem] lg:block">
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#e7d8ff] via-[#f5e9fb] to-[#ffe6ef] opacity-90 blur-[1px]" />
                <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white/25 shadow-[0_20px_70px_rgba(115,79,157,0.12)] backdrop-blur-sm" />
                <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/95 to-[#f6efff]/90 shadow-[0_24px_50px_rgba(115,79,157,0.16)]">
                  <span className="grid h-20 w-20 place-items-center rounded-[1.6rem] bg-gradient-to-br from-[#b998ed] via-[#bd9ce9] to-[#e6a8c6] text-white shadow-lg shadow-[#9c74c2]/25">
                    <WandSparkles size={36} strokeWidth={1.4} />
                  </span>
                </div>
                <div className="absolute right-2 top-7 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-[0_12px_35px_rgba(76,53,105,0.1)] backdrop-blur-md">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#a17ac3]">A little lovely</p>
                  <p className="mt-1 text-sm font-semibold text-[#40344f]">Curated for you</p>
                </div>
                <span className="absolute bottom-7 left-2 h-10 w-10 rounded-2xl border border-white/80 bg-[#f7e8f4]/90 shadow-md shadow-[#9c74c2]/10" />
                <span className="absolute bottom-10 right-5 h-3 w-3 rounded-full bg-[#d89abd] shadow-[0_0_20px_rgba(216,154,189,0.7)]" />
                <Sparkles className="absolute left-8 top-12 text-[#aa87d3]" size={18} />
                <Sparkles className="absolute bottom-9 right-12 text-[#cf91b1]" size={14} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 pt-4 sm:px-6 sm:pt-6">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#916bb8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d58eae]" />
                Fresh finds
              </p>
              <h2 className="home-heading mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#302642] sm:text-3xl">
                Latest products
              </h2>
            </div>
            <Link
              className="home-view-link hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#7952a7] transition sm:inline-flex"
              to="/products"
            >
              View all products <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          {loading ? (
            <Skeleton count={8} />
          ) : error ? (
            <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-[0_12px_40px_rgba(76,53,105,0.05)]">
              <p className="font-semibold text-[#382e48]">We couldn’t load the latest products.</p>
              <p className="mt-2 text-sm text-[#817791]">{error}</p>
              <button
                className="home-primary-button mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                onClick={retry}
                type="button"
              >
                Retry
              </button>
            </div>
          ) : products.length > 0 ? (
            <ProductGrid products={products.slice(0, 8)} />
          ) : (
            <p className="rounded-3xl border border-[#eee8f5] bg-white px-6 py-12 text-center text-[#817791] shadow-[0_12px_40px_rgba(76,53,105,0.04)]">
              New products are on their way. Please check back soon.
            </p>
          )}

          <Link
            className="home-secondary-button mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold sm:hidden"
            to="/products"
          >
            View all products <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </section>
      </main>
      <footer className="border-t border-[#eee8f5] bg-white/55 py-7 text-center text-xs font-medium tracking-wide text-[#8c8299]">
        atelier. · Carefully chosen, made for everyday.
      </footer>
    </div>
  );
}
