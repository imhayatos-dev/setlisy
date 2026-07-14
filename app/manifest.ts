import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Setlisy",
    short_name: "Setlisy",
    description:
      "セットリストとセット図をシンプルに作成できるライブ準備ツール。",
    start_url: "/",
    display: "standalone",
    background_color: "#ecebe7",
    theme_color: "#111111",
    orientation: "any",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
