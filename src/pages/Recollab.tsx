import React from "react";

const GOLD = "#C9A84C";
const CHARCOAL = "#2D2D2D";
const BODY_FONT = "'DM Sans', sans-serif";
const HEADING_FONT = "'Cormorant Garamond', serif";

const bodyStyle: React.CSSProperties = {
  fontFamily: BODY_FONT,
  color: CHARCOAL,
  lineHeight: 1.9,
  fontSize: 22,
  margin: 0,
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: HEADING_FONT,
  fontSize: 46,
  fontWeight: 600,
  color: CHARCOAL,
  margin: "0 0 28px 0",
};

const cards = [
  {
    title: "validates data integrity",
    body: "catches errors and inconsistencies before they become expensive problems.",
  },
  {
    title: "runs automated risk audits",
    body: "real-time intelligence on what needs attention now, not in 20 years.",
  },
  {
    title: "generates reserve studies",
    body: "living financial models that update as your building data changes.",
  },
  {
    title: "matches you with verified contractors",
    body: "connects the right people to the right problems at the right time.",
  },
  {
    title: "helps negotiate better insurance rates",
    body: "uses your own maintenance records as leverage to get better deals.",
  },
];

const Recollab = () => {
  return (
    <div
      style={{
        background: "#FAFAF8",
        minHeight: "100vh",
        fontFamily: BODY_FONT,
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "48px 32px 96px",
        }}
      >
        {/* ← home */}
        <a
          href="/"
          style={{
            display: "inline-block",
            fontFamily: BODY_FONT,
            fontSize: 19,
            color: GOLD,
            textDecoration: "none",
            marginBottom: 48,
            letterSpacing: "0.02em",
          }}
        >
          &larr; home
        </a>

        {/* ── HERO ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontSize: 62, marginBottom: 16 }}>🏢</div>
          <h1
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 68,
              fontWeight: 600,
              color: CHARCOAL,
              margin: "0 0 10px 0",
              lineHeight: 1.1,
            }}
          >
            Recollab AI
          </h1>
          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: 24,
              color: "#6B6B6B",
              margin: "0 0 20px 0",
              lineHeight: 1.6,
            }}
          >
            what we're building for buildings
          </p>
          <span
            style={{
              display: "inline-block",
              fontFamily: BODY_FONT,
              fontSize: 16,
              fontWeight: 600,
              color: GOLD,
              background: "#FFF8EC",
              border: `1px solid ${GOLD}`,
              borderRadius: 4,
              padding: "4px 12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            PROPTECH
          </span>
        </div>

        {/* ── SECTION 1 — opening body ─────────────────────── */}
        <div style={{ marginBottom: 72 }}>
          <p
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 30,
              fontWeight: 500,
              color: CHARCOAL,
              lineHeight: 1.6,
              margin: "0 0 28px 0",
            }}
          >
            i'm the product manager at recollab, and honestly it's one of the most exciting things i'm working on right now.
          </p>

          <p style={{ ...bodyStyle, marginBottom: 24 }}>
            recollab is building the financial operating system for property managers. the problem it solves is really specific but really big: most buildings in north america are managed using static PDFs and outdated reserve fund studies that tell you "here's what's going to break in 20 years" with zero real-time intelligence, zero scenario planning, and zero connection to the people who actually need to act on that information. boards, insurers, contractors, lenders.
          </p>

          <p style={{ ...bodyStyle }}>
            recollab changes that. you drag and drop any file format, the ai ingests it, maps it to the specific building component it belongs to, and suddenly you have a living financial model instead of a dusty PDF.
          </p>
        </div>

        {/* ── SECTION 2 — what it actually does ───────────── */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={sectionHeadingStyle}>what it actually does</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cards.map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#FFFFFF",
                  borderLeft: `3px solid ${GOLD}`,
                  borderRadius: 10,
                  padding: "24px 28px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}
              >
                <p
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 21,
                    fontWeight: 600,
                    color: CHARCOAL,
                    margin: "0 0 6px 0",
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 20,
                    color: "#5A5A5A",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3 — my role ──────────────────────────── */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={sectionHeadingStyle}>my role</h2>

          <p style={{ ...bodyStyle }}>
            my role is product and UX strategy. basically turning what the engineers and ml team are building into something that actually makes sense for a property manager sitting at their desk trying to figure out how to tell their board they need to raise fees.
          </p>
          <p style={{ ...bodyStyle, marginTop: 20 }}>
            that means talking to users constantly, mapping flows, pressure testing assumptions, and making sure what we ship is something a real person can actually use without a manual.
          </p>
        </div>

        {/* ── SECTION 4 — see it in action ────────────────── */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={sectionHeadingStyle}>see it in action</h2>

          <p style={{ ...bodyStyle, marginBottom: 28 }}>
            this is our investor demo. have a look around.
          </p>

          <iframe
            src="https://recostudy-investor-hub.vercel.app"
            style={{
              width: "100%",
              height: 650,
              border: `1px solid ${GOLD}`,
              borderRadius: 16,
              display: "block",
            }}
            title="RECOstudy Investor Demo"
          />

          <div style={{ marginTop: 20 }}>
            <a
              href="https://recostudy-investor-hub.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                fontFamily: BODY_FONT,
                fontSize: 15,
                fontWeight: 600,
                color: "#1A1A1A",
                background: GOLD,
                borderRadius: 8,
                padding: "12px 28px",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              open full demo &rarr;
            </a>
          </div>
        </div>

        {/* ── SECTION 5 — raising callout ─────────────────── */}
        <div
          style={{
            background: "#FFF8EC",
            border: `2px solid ${GOLD}`,
            borderRadius: 20,
            padding: "48px 48px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: 16,
              fontWeight: 600,
              color: GOLD,
              textTransform: "uppercase" as const,
              letterSpacing: "0.18em",
              margin: "0 0 16px 0",
            }}
          >
            currently raising
          </p>

          <h2
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 36,
              fontWeight: 600,
              color: CHARCOAL,
              margin: "0 0 20px 0",
              lineHeight: 1.3,
            }}
          >
            want to get your finger in the pie?
          </h2>

          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: 17,
              color: CHARCOAL,
              lineHeight: 1.9,
              margin: "0 0 32px 0",
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            we are currently raising!! if you or someone you know is interested in what we're building in proptech + AI, we would genuinely love to talk. get in touch :)
          </p>

          <a
            href="mailto:nadykupane@gmail.com"
            style={{
              display: "inline-block",
              fontFamily: BODY_FONT,
              fontSize: 20,
              fontWeight: 600,
              color: "#1A1A1A",
              background: GOLD,
              borderRadius: 8,
              padding: "16px 36px",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            get in touch &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

export default Recollab;
