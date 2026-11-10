import { api } from "./client";
import type { Product } from "../types/product";

type ProductsResponse = Product[] | { products: Product[] };
type ProductResponse = Product | { product: Product };

function normalizeProduct(value: unknown): Product | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("_id" in value) ||
    typeof value._id !== "string" ||
    !("name" in value) ||
    typeof value.name !== "string" ||
    !("price" in value) ||
    typeof value.price !== "number" ||
    !Number.isFinite(value.price)
  ) {
    return null;
  }

  const stock =
    "stock" in value && typeof value.stock === "number" && Number.isFinite(value.stock)
      ? Math.max(0, value.stock)
      : 0;

  return {
    _id: value._id,
    name: value.name,
    price: value.price,
    stock,
    description: "description" in value && typeof value.description === "string" ? value.description : "",
    category: "category" in value && typeof value.category === "string" ? value.category : "",
    image: "image" in value && typeof value.image === "string" ? value.image : "",
    createdAt: "createdAt" in value && typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
}

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await api.get<ProductsResponse>("/products", { signal });
  const products = Array.isArray(response.data) ? response.data : response.data?.products;
  if (!Array.isArray(products)) {
    throw new Error("The server returned an invalid product list.");
  }

  const normalized = products.map(normalizeProduct);
  if (normalized.some((product) => product === null)) {
    throw new Error("The server returned an invalid product list.");
  }
  return normalized.filter((product): product is Product => product !== null);
}

export async function getProductById(id: string, signal?: AbortSignal): Promise<Product> {
  const response = await api.get<ProductResponse>(`/products/${encodeURIComponent(id)}`, { signal });
  const product =
    response.data && typeof response.data === "object" && "product" in response.data
      ? response.data.product
      : response.data;

  const normalized = normalizeProduct(product);
  if (!normalized) {
    throw new Error("The server returned an invalid product.");
  }
  return normalized;
}
