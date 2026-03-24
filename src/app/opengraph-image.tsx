/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

/**
 * Dynamic OG image for social sharing.
 *
 * Renders the hero tagline on the warm cream background using the same
 * academic editorial aesthetic as the landing page. This matches the
 * screenshot Wayne approved — serif display type, navy + burgundy,
 * warm off-white background.
 *
 * Next.js serves this at /opengraph-image automatically and injects
 * the <meta property="og:image"> tag via the metadata API.
 */

export const runtime = "edge";
export const alt = "Backward Builder — Describe the understanding. AI designs the unit.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  /* Load fonts for the OG image */
  const instrumentSerifFont = fetch(
    new URL("https://fonts.gstatic.com/s/instrumentserif/v4/jizBRFtNs2ka5fXjeivQ4LroWlx-2zIZhE1yUA.woff2")
  ).then((res) => res.arrayBuffer());

  const plusJakartaFont = fetch(
    new URL("https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_d0n9.woff2")
  ).then((res) => res.arrayBuffer());

  const [instrumentData, jakartaData] = await Promise.all([
    instrumentSerifFont,
    plusJakartaFont,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAF6F0",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Subtle dot grid overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(26,26,25,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Butterfly logo placeholder — simple BB monogram */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontSize: "28px",
              color: "#1a1a19",
              letterSpacing: "-0.5px",
            }}
          >
            Backward Builder
          </span>
        </div>

        {/* Main tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontSize: "72px",
              color: "#1a1a19",
              lineHeight: 1.15,
            }}
          >
            Describe the understanding.
          </span>
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontSize: "72px",
              color: "#6B2D3E",
              fontStyle: "italic",
              lineHeight: 1.15,
              marginTop: "4px",
            }}
          >
            AI designs the unit.
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            fontFamily: "Plus Jakarta Sans",
            fontSize: "24px",
            color: "#5a5a58",
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: "800px",
            marginTop: "32px",
          }}
        >
          Standards-aligned unit plans with performance tasks, rubrics,
          checks for understanding, and sequenced learning activities —
          built in minutes, not weekends.
        </span>

        {/* Bottom branding bar */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "Plus Jakarta Sans",
              fontSize: "16px",
              color: "#8a8a87",
            }}
          >
            backwardbuilder.com · Powered by Claude AI
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Instrument Serif",
          data: instrumentData,
          style: "normal",
          weight: 400,
        },
        {
          name: "Plus Jakarta Sans",
          data: jakartaData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
