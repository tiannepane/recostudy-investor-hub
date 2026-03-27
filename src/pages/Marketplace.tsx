import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Data ──────────────────────────────────────────────── */

const BIDS = [
  {
    name: "Restoration Experts LLC",
    photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&h=80&fit=crop",
    stars: 4.8,
    responseTime: "Response within 3 business days",
    note: "Strong track record with 12 comparable facade restoration projects in the GTA. Best price-to-quality ratio for this scope.",
    amount: 438000,
    amountLabel: "$438,000",
  },
  {
    name: "Facade Solutions Group",
    photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=80&h=80&fit=crop",
    stars: 4.6,
    responseTime: "Response within 5 business days",
    note: "Competitive pricing with solid structural credentials. Fewer directly comparable facade references but strong overall portfolio.",
    amount: 455000,
    amountLabel: "$455,000",
  },
  {
    name: "BuildRight Contractors",
    photo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=80&h=80&fit=crop",
    stars: 4.9,
    responseTime: "Response within 4 business days",
    note: "Highest rated contractor on the platform. Premium pricing reflects demand.",
    amount: 472000,
    amountLabel: "$472,000",
  },
];

/* ─── Funding Analysis Modal ────────────────────────────── */

const BidModal = ({
  bid,
  onClose,
  onSelect,
}: {
  bid: (typeof BIDS)[0];
  onClose: () => void;
  onSelect: () => void;
}) => (
  <>
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
      }}
    />

    {/* Modal */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 101,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          width: 420,
          maxWidth: "calc(100% - 48px)",
          background: "#FFFFFF",
          borderRadius: 20,
          border: "1px solid #E0E0E0",
          padding: 32,
          pointerEvents: "auto",
          position: "relative",
        }}
      >
        {/* Close X */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} style={{ color: "#999" }} />
        </button>

        {/* Contractor info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <img
            src={bid.photo}
            alt={bid.name}
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>
              {bid.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Star size={11} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
              <span style={{ fontSize: 12, color: "#6B7280" }}>{bid.stars}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "#E5E7EB", marginBottom: 20 }} />

        {/* Bid amount */}
        <p style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Bid Amount
        </p>
        <p style={{ fontSize: 28, fontWeight: 600, color: "#0A0A0A", fontFamily: "monospace", margin: "0 0 16px" }}>
          {bid.amountLabel}
        </p>

        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, marginBottom: 24 }}>
          {bid.note}
        </p>

        {/* Select button */}
        <button
          onClick={onSelect}
          style={{
            width: "100%",
            padding: "12px 0",
            background: "#0A0A0A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Select &amp; Continue &rarr;
        </button>
        <p style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 8 }}>
          or click outside to dismiss
        </p>
      </motion.div>
    </div>
  </>
);

/* ─── Page ───────────────────────────────────────────────── */

const Marketplace = () => {
  const navigate = useNavigate();
  const [selectedBid, setSelectedBid] = useState<(typeof BIDS)[0] | null>(null);

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      <Sidebar
        activeItem="marketplace"
        visitedItems={["overview", "inventory", "financials", "projects"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "48px 60px 60px" }}>
          <TopBar
            breadcrumb="Buildings › City Gate 1, LMS 195 › Marketplace"
            activeItem="marketplace"
          />

          {/* Status line */}
          <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>
            3 bids received · Sorted by bid amount
          </p>

          {/* RFP Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
              marginBottom: 32,
              maxHeight: 150,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=300&fit=crop"
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(10,10,10,0.6)",
              }}
            />
            <div style={{ padding: 16, position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "white",
                    background: "#0A0A0A",
                    borderRadius: 4,
                    padding: "2px 7px",
                    flexShrink: 0,
                  }}
                >
                  Live RFP
                </span>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Exterior Facade &amp; Balconies Restoration
                </p>
              </div>

              {[
                { label: "Scope", value: "Full exterior restoration, balcony waterproofing, structural repair", color: "#C4CAD8" },
                { label: "Budget", value: "$425,000 — $480,000", color: "#FFFFFF" },
                { label: "Timeline", value: "Q2 2026 — Q4 2026", color: "#C4CAD8" },
                { label: "Priority", value: "● Critical", color: "#FFFFFF" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 3,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#8B92A8", flexShrink: 0, width: 56 }}>
                    {row.label}
                  </span>
                  <span style={{ color: row.color, fontWeight: row.label === "Budget" ? 500 : 400, fontFamily: row.label === "Budget" ? "monospace" : "inherit" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contractor Bids header */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", marginBottom: 12 }}
          >
            Contractor Bids
          </motion.p>

          {/* Bid cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BIDS.map((bid, i) => (
              <motion.div
                key={bid.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 + i * 0.15 }}
                onClick={() => setSelectedBid(bid)}
                style={{
                  borderRadius: 12,
                  border: "1px solid #E0E0E0",
                  background: "#FFFFFF",
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0A0A0A")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E0E0E0")}
              >
                {/* Main row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 44 }}>
                  {/* Rank */}
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#C0C0C0",
                      width: 24,
                      flexShrink: 0,
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    {i + 1}
                  </p>

                  {/* Photo */}
                  <img
                    src={bid.photo}
                    alt={bid.name}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />

                  {/* Name + stars */}
                  <div style={{ width: 190, flexShrink: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0A0A0A",
                        marginBottom: 3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {bid.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={12} style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#6B7280" }}>{bid.stars}</span>
                    </div>
                  </div>

                  {/* Response time */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <Clock size={12} style={{ color: "#999" }} />
                    <span style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>
                      {bid.responseTime}
                    </span>
                  </div>

                  <div style={{ flex: 1 }} />

                  {/* Bid amount */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#999",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 2,
                      }}
                    >
                      Bid Amount
                    </p>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#0A0A0A",
                        margin: 0,
                      }}
                    >
                      {bid.amountLabel}
                    </p>
                  </div>
                </div>

                {/* Note */}
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12.5,
                    color: "#6B7280",
                    lineHeight: 1.5,
                    paddingLeft: 82,
                  }}
                >
                  {bid.note}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Bid Modal */}
      <AnimatePresence>
        {selectedBid && (
          <BidModal
            bid={selectedBid}
            onClose={() => setSelectedBid(null)}
            onSelect={() => navigate("/insurance")}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
