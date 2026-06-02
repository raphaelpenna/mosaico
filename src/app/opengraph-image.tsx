import { ImageResponse } from "next/og";

/**
 * OG/Twitter image gerada dinamicamente (convenção de arquivo do App Router).
 * Espelha a identidade: fundo escuro, mosaico de azulejos + wordmark.
 */
export const alt = "Mosaico — gerenciador de tarefas escopado por marca";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TILES = [
  "#ffffff",
  "rgba(255,255,255,0.55)",
  "rgba(255,255,255,0.55)",
  "#8585f5",
];

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "90px",
        background: "#0a0a0b",
        color: "#ededee",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: 128,
          height: 128,
          marginBottom: 52,
        }}
      >
        {TILES.map((c, i) => (
          <div
            key={i}
            style={{
              width: 56,
              height: 56,
              margin: 4,
              borderRadius: 14,
              background: c,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: -3,
        }}
      >
        Mosaico
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 36,
          color: "#9c9ca6",
          marginTop: 18,
        }}
      >
        Gerenciador de tarefas escopado por marca
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 26,
          color: "#8585f5",
          marginTop: 44,
          letterSpacing: 2,
        }}
      >
        GRUPO AZZAS
      </div>
    </div>,
    { ...size },
  );
}
