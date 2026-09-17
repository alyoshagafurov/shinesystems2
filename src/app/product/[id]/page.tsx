import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/SiteShell";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const getProduct = cache((id: string) =>
  prisma.product.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  })
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Товар не найден" };
  return {
    title: `${product.name} — AUTOSHINE.TJ`,
    description: product.description || product.name,
    openGraph: {
      title: product.name,
      description: product.description || product.name,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const similar = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    orderBy: { order: "asc" },
    take: 20,
    select: { id: true, name: true, description: true, price: true, images: true, inStock: true },
  });

  return (
    <SiteShell>
      <ProductDetails
        key={product.id}
        categoryName={product.category?.name ?? ""}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          composition: product.composition,
          dilution: product.dilution,
          application: product.application,
          precautions: product.precautions,
          storage: product.storage,
          shelfLife: product.shelfLife,
          price: product.price,
          images: product.images,
          inStock: product.inStock,
        }}
      />

      {similar.length > 0 && (
        <section className="mt-8 border-t border-neutral-100 sm:max-w-5xl sm:mx-auto sm:px-4 sm:border-0">
          <h2 className="px-4 sm:px-0 py-4 text-lg font-bold">Похожие товары</h2>
          <div className="grid grid-cols-2 gap-[1px] bg-neutral-100 sm:gap-4 sm:bg-transparent sm:grid-cols-3 lg:grid-cols-4 sm:pb-8">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
