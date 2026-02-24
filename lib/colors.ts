"use server";

export interface ColorPalette {
  dominant: string;
  palette: string[];
  vibrant: string;
  muted: string;
  darkVibrant: string;
  darkMuted: string;
}

export async function extractColors(imageUrl: string): Promise<ColorPalette> {
  try {
    // Dynamic import since node-vibrant is a heavy dependency
    const Vibrant = (await import("node-vibrant")).default;
    const palette = await Vibrant.from(imageUrl).getPalette();

    const dominant =
      palette.DarkVibrant?.hex ||
      palette.Vibrant?.hex ||
      palette.DarkMuted?.hex ||
      "#1a1a2e";

    return {
      dominant,
      palette: [
        palette.Vibrant?.hex,
        palette.DarkVibrant?.hex,
        palette.LightVibrant?.hex,
        palette.Muted?.hex,
        palette.DarkMuted?.hex,
        palette.LightMuted?.hex,
      ].filter(Boolean) as string[],
      vibrant: palette.Vibrant?.hex ?? "#a855f7",
      muted: palette.Muted?.hex ?? "#6b7280",
      darkVibrant: palette.DarkVibrant?.hex ?? "#1a1a2e",
      darkMuted: palette.DarkMuted?.hex ?? "#111111",
    };
  } catch (error) {
    console.error("Color extraction failed:", error);
    return {
      dominant: "#1a1a2e",
      palette: ["#1a1a2e", "#a855f7"],
      vibrant: "#a855f7",
      muted: "#6b7280",
      darkVibrant: "#1a1a2e",
      darkMuted: "#111111",
    };
  }
}
