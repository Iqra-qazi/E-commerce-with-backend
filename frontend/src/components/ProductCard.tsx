import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { formatPrice } from "../utils/formatPrice";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      className="product-card group overflow-hidden rounded-[1.35rem] border bg-white transition duration-300 hover:-translate-y-1"
      to={`/products/${product._id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f2edf8]">
        {product.image ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            src={product.image}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-[#9b91a8]">No image available</div>
        )}
        {product.stock <= 0 && (
          <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-xs font-semibold text-[#6e6579] shadow-sm">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4 sm:p-[1.15rem]">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#9872bb]">
          {product.category || "General"}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold leading-6 text-[#342a43]">{product.name}</h3>
        <p className="mt-3 font-bold text-[#725196]">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
