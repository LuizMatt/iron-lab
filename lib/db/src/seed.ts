import { db } from ".";
import { sliderImages, packagesTable } from "./schema";

async function main() {
await db.insert(sliderImages).values([
  {
    image_url: "https://placehold.co/1200x400",
    mobile_image_url: "https://placehold.co/600x400",
    alt_text: "Slide 1",
    display_order: 1,
    is_active: true,
  },
  {
    image_url: "https://placehold.co/1200x400?text=Slide+2",
    mobile_image_url: null,
    alt_text: "Slide 2",
    display_order: 2,
    is_active: true,
  },
  {
    image_url: "https://placehold.co/1200x400?text=Slide+3",
    mobile_image_url: null,
    alt_text: "Slide 3",
    display_order: 3,
    is_active: false,
  },
]);
await db.insert(packagesTable).values([
    {
      name: "Básico",
      subtitle: "Para quem está começando",
      price: 9900,
      features: ["Acesso à academia", "Vestiário", "Musculação"],
      is_featured: false,
      is_active: true,
      display_order: 1,
    },
    {
      name: "Pro",
      subtitle: "Para quem é sério",
      price: 19900,
      features: ["Tudo do Básico", "Aulas em grupo", "Avaliação física mensal", "App de treinos"],
      is_featured: true,
      is_active: true,
      display_order: 2,
    },
    {
      name: "Elite",
      subtitle: "Experiência completa",
      price: 34900,
      features: ["Tudo do Pro", "Personal trainer", "Nutricionista", "Acesso 24h", "Área VIP"],
      is_featured: false,
      is_active: true,
      display_order: 3,
    },
  ]);
}

main();