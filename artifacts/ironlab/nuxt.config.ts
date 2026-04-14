import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  devServer: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "3000"),
  },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiBase: "/api",
    },
  },

  app: {
    head: {
      title: "IRONLAB — Academia",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Sistema de gestão IRONLAB Academia" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },

  compatibilityDate: "2025-01-01",
});
