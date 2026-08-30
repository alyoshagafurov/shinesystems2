import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true, images: true },
  });
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
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!product) return notFound();

  return redirect(`/?product=${product.id}`);
}
