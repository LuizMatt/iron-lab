import { db } from ".";
import { sliderImages } from "./schema";

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

}

main();