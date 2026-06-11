-- ═══════════════════════════════════════════════════════════════════════════
-- WiBC Supplier Gender Equity Diagnostic (SGED) — Supabase Schema
-- Run this SQL in your Supabase project:
--   Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable the pgcrypto extension for UUID generation (already enabled by default on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Maturity band ENUM ──────────────────────────────────────────────────────
CREATE TYPE maturity_band AS ENUM ('Emerging', 'Developing', 'Strategic', 'Innovating');

-- ── suppliers table ─────────────────────────────────────────────────────────
-- Stores a unique record per supplier organisation (keyed by contact email).
CREATE TABLE IF NOT EXISTS public.suppliers (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  company_name    TEXT          NOT NULL,
  contact_name    TEXT          NOT NULL,
  contact_email   TEXT          NOT NULL UNIQUE,
  company_size    TEXT          NOT NULL,   -- e.g. "1–10", "11–50", "51–250", "251+"
  industry_sector TEXT          NOT NULL
);

-- Index for fast email lookups (upsert on conflict)
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON public.suppliers (contact_email);

-- ── sged_assessments table ──────────────────────────────────────────────────
-- Each submission creates a new assessment snapshot (history is preserved).
CREATE TABLE IF NOT EXISTS public.sged_assessments (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT now(),
  supplier_id               UUID          NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,

  -- 7 goal scores (each 0–5)
  flexible_working          SMALLINT      NOT NULL CHECK (flexible_working          BETWEEN 0 AND 5),
  senior_representation     SMALLINT      NOT NULL CHECK (senior_representation     BETWEEN 0 AND 5),
  executive_accountability  SMALLINT      NOT NULL CHECK (executive_accountability  BETWEEN 0 AND 5),
  frontline_progression     SMALLINT      NOT NULL CHECK (frontline_progression     BETWEEN 0 AND 5),
  intersectional_pay_gap    SMALLINT      NOT NULL CHECK (intersectional_pay_gap    BETWEEN 0 AND 5),
  bias_free_recruitment     SMALLINT      NOT NULL CHECK (bias_free_recruitment     BETWEEN 0 AND 5),
  sponsorship_networks      SMALLINT      NOT NULL CHECK (sponsorship_networks      BETWEEN 0 AND 5),

  -- Calculated fields
  total_score               SMALLINT      NOT NULL CHECK (total_score BETWEEN 0 AND 35),
  maturity_band             maturity_band NOT NULL,

  -- Integration tracking
  hubspot_synced            BOOLEAN       NOT NULL DEFAULT false
);

-- Index for supplier ↔ assessment joins
CREATE INDEX IF NOT EXISTS idx_assessments_supplier ON public.sged_assessments (supplier_id);

-- ── Row Level Security (RLS) ────────────────────────────────────────────────
-- We use the service-role key server-side, so public access is locked down.

ALTER TABLE public.suppliers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sged_assessments ENABLE ROW LEVEL SECURITY;

-- Deny all public access (API routes use the service-role key which bypasses RLS)
CREATE POLICY "No public access - suppliers"
  ON public.suppliers FOR ALL USING (false);

CREATE POLICY "No public access - assessments"
  ON public.sged_assessments FOR ALL USING (false);

-- ── Useful admin views ──────────────────────────────────────────────────────
-- Average scores per goal across all assessments
CREATE OR REPLACE VIEW public.admin_score_averages AS
SELECT
  ROUND(AVG(flexible_working)::NUMERIC, 2)         AS avg_flexible_working,
  ROUND(AVG(senior_representation)::NUMERIC, 2)    AS avg_senior_representation,
  ROUND(AVG(executive_accountability)::NUMERIC, 2) AS avg_executive_accountability,
  ROUND(AVG(frontline_progression)::NUMERIC, 2)    AS avg_frontline_progression,
  ROUND(AVG(intersectional_pay_gap)::NUMERIC, 2)   AS avg_intersectional_pay_gap,
  ROUND(AVG(bias_free_recruitment)::NUMERIC, 2)    AS avg_bias_free_recruitment,
  ROUND(AVG(sponsorship_networks)::NUMERIC, 2)     AS avg_sponsorship_networks,
  ROUND(AVG(total_score)::NUMERIC, 2)              AS avg_total_score,
  COUNT(*)                                          AS total_assessments
FROM public.sged_assessments;

-- Distribution of maturity bands
CREATE OR REPLACE VIEW public.admin_band_distribution AS
SELECT
  maturity_band,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM public.sged_assessments
GROUP BY maturity_band
ORDER BY
  CASE maturity_band
    WHEN 'Emerging'   THEN 1
    WHEN 'Developing' THEN 2
    WHEN 'Strategic'  THEN 3
    WHEN 'Innovating' THEN 4
  END;

-- ── interested table (Waitlist / Register Interest) ─────────────────────────
-- Stores users who registered their interest via QR code.
CREATE TABLE IF NOT EXISTS public.interested (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  name            TEXT          NOT NULL,
  surname         TEXT          NOT NULL,
  company         TEXT          NOT NULL,
  position        TEXT          NOT NULL,
  email           TEXT          NOT NULL UNIQUE
);

ALTER TABLE public.interested ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access - interested"
  ON public.interested FOR ALL USING (false);
