import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
  "Бесконтактные шампуни",
  "Осушители кузова",
  "Шампуни для ручной мойки",
  "Спецочистители",
  "Мойка двигателя",
  "Уход за резиной и пластиком",
  "Ароматизаторы",
  "Химчистка и уход за интерьером",
  "Стеклоочистители",
  "Долговременные защитные покрытия",
  "Антидождь",
  "Наборы для ухода за автомобилем",
  "AirLine аэрозоли",
  "Составы для пленок",
  "Пленки",
  "Протирочный материал",
  "Губки и аппликаторы",
  "Щетки и кисти",
  "Распылители",
  "Полировальные пасты",
  "Полировальные машинки",
  "Полировальные круги",
  "Автоскрабы, абразивные материалы",
  "Оборудование",
  "Аксессуары",
  "Световое оборудование",
  "Маркетинг",
];

function slugify(str: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya",
  };
  return str
    .toLowerCase()
    .split("")
    .map((c) => map[c] || c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { login: "admin" },
    update: { password: hash },
    create: { login: "admin", password: hash },
  });
  console.log("Admin created: admin / admin123");

  for (let i = 0; i < categories.length; i++) {
    const name = categories[i];
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { slug },
      update: { name, order: i },
      create: { name, slug, order: i },
    });
  }
  console.log(`${categories.length} categories seeded`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
