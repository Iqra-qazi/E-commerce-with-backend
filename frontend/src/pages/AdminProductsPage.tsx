import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ImagePlus, LoaderCircle, PackagePlus, X } from "lucide-react";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../api/client";
import { getErrorMessage } from "../utils/errors";

type Product = {
  _id: string;
  name: string;
  image?: string;
  price: number;
  stock?: number;
  category?: string;
};

const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name."),
  description: z.string(),
  price: z.coerce.number().positive("Price must be greater than 0."),
  stock: z.coerce.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative."),
  category: z.string(),
  image: z.instanceof(FileList).refine((files) => files.length > 0, "Image is required."),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormValues = z.output<typeof productSchema>;

function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

function isForbidden(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

function showRequestError(error: unknown, fallback: string) {
  if (isForbidden(error)) {
    toast.error("Admin access only");
  } else if (!isUnauthorized(error)) {
    toast.error(getErrorMessage(error, fallback));
  }
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "0",
      category: "",
    },
  });

  const imageRegistration = register("image", {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      setImagePreview(file ? URL.createObjectURL(file) : null);
    },
  });

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchProducts = useCallback(async () => {
    const response = await api.get<{ products: Product[] }>("/products");
    if (!Array.isArray(response.data.products)) {
      throw new Error("The server returned an invalid product list.");
    }
    return response.data.products;
  }, []);

  useEffect(() => {
    let active = true;

    fetchProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((error: unknown) => {
        if (active) showRequestError(error, "Unable to load products.");
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, [fetchProducts]);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      setProducts(await fetchProducts());
    } catch (error) {
      showRequestError(error, "Unable to load products.");
    } finally {
      setLoadingProducts(false);
    }
  }, [fetchProducts]);

  function closeModal() {
    setIsModalOpen(false);
    reset();
    setImagePreview(null);
  }

  function onInvalid(formErrors: FieldErrors<ProductFormInput>) {
    console.error("Product form validation failed:", formErrors);
    toast.error("Please correct the highlighted fields before saving.");
  }

  async function onSubmit(values: ProductFormValues) {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("price", String(values.price));
    formData.append("description", values.description);
    formData.append("stock", String(values.stock));
    formData.append("category", values.category);
    formData.append("image", values.image[0]);

    setIsSaving(true);
    try {
      await api.post("/products", formData);
    } catch (error) {
      showRequestError(error, "Unable to add product.");
      return;
    } finally {
      setIsSaving(false);
    }

    toast.success("Product added successfully.");
    closeModal();
    await loadProducts();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col justify-between gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">STORE MANAGEMENT</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Products</h1>
            <p className="mt-2 text-sm text-stone-500">Manage the items available in your store.</p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            <PackagePlus aria-hidden="true" size={17} />
            Add Product
          </button>
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-stone-900">Product catalogue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loadingProducts ? (
                  <tr>
                    <td className="px-5 py-12 text-center text-stone-500" colSpan={4}>
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
                        Loading products…
                      </span>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td className="px-5 py-12 text-center text-stone-500" colSpan={4}>
                      No products yet. Add your first product to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              alt=""
                              className="h-11 w-11 rounded-lg border border-stone-200 object-cover"
                              src={product.image}
                            />
                          ) : (
                            <span className="grid h-11 w-11 place-items-center rounded-lg bg-stone-100 text-stone-400">
                              <ImagePlus aria-hidden="true" size={18} />
                            </span>
                          )}
                          <span className="font-medium text-stone-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-600">{Number(product.price).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-stone-600">{product.stock ?? 0}</td>
                      <td className="px-5 py-3.5 text-stone-600">{product.category || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) closeModal();
          }}
        >
          <section
            aria-labelledby="add-product-title"
            aria-modal="true"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
              <div>
                <p className="eyebrow">NEW INVENTORY</p>
                <h2 className="mt-1 text-xl font-semibold text-stone-950" id="add-product-title">
                  Add product
                </h2>
              </div>
              <button
                aria-label="Close dialog"
                className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                disabled={isSaving}
                onClick={closeModal}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>

            <form
              className="space-y-5 px-6 py-5"
              noValidate
              onSubmit={handleSubmit(onSubmit, onInvalid)}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                  Name <span className="text-red-600">*</span>
                  <input
                    className="input-shell mt-2 h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none placeholder:text-stone-400"
                    placeholder="Product name"
                    {...register("name")}
                  />
                  {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
                </label>

                <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                  Description
                  <textarea
                    className="input-shell mt-2 min-h-24 w-full resize-y rounded-xl border border-stone-200 px-3.5 py-3 text-sm outline-none placeholder:text-stone-400"
                    placeholder="Describe this product"
                    {...register("description")}
                  />
                </label>

                <label className="block text-sm font-medium text-stone-700">
                  Price <span className="text-red-600">*</span>
                  <input
                    className="input-shell mt-2 h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none"
                    min="0.01"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    {...register("price")}
                  />
                  {errors.price && <span className="mt-1 block text-xs text-red-600">{errors.price.message}</span>}
                </label>

                <label className="block text-sm font-medium text-stone-700">
                  Stock
                  <input
                    className="input-shell mt-2 h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none"
                    min="0"
                    step="1"
                    type="number"
                    {...register("stock")}
                  />
                  {errors.stock && <span className="mt-1 block text-xs text-red-600">{errors.stock.message}</span>}
                </label>

                <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                  Category
                  <input
                    className="input-shell mt-2 h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none placeholder:text-stone-400"
                    placeholder="Category"
                    {...register("category")}
                  />
                </label>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700" htmlFor="product-image">
                    Product image <span className="text-red-600">*</span>
                  </label>
                  <input
                    accept="image/*"
                    className="mt-2 block w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-stone-700"
                    id="product-image"
                    type="file"
                    {...imageRegistration}
                  />
                  {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image.message}</p>}
                  {imagePreview && (
                    <img
                      alt="Selected product preview"
                      className="mt-3 h-28 w-28 rounded-xl border border-stone-200 object-cover"
                      src={imagePreview}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  className="h-11 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                  disabled={isSaving}
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving && <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />}
                  {isSaving ? "Saving…" : "Save product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
