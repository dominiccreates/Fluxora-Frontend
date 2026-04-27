/**
 * MetricCard
 * ──────────
 * Treasury overview metric card.
 * Uses design tokens for all visual properties so it responds
 * correctly to light/dark theme switching.
 */

import { Metric } from "./Metric";

export default function MetricCard({ icon, label, value, desc }: Metric) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-surface-default)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-xl)",
        height: "100%",
      }}
    >
      {/* Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          fontSize: "1.75rem",
          lineHeight: 1,
          marginBottom: "var(--space-lg)",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Label */}
      <div
        style={{
          font: "var(--font-label-md)",
          color: "var(--color-text-tertiary)",
          marginBottom: "var(--space-sm)",
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          font: "var(--font-heading-2)",
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-sm)",
        }}
      >
        {value}
      </div>

      {/* Description */}
      <p
        style={{
          font: "var(--font-body-sm)",
          color: "var(--color-text-tertiary)",
          marginTop: "auto",
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
}
