-- Duke Vanguard: Add FY2026 OMS fields to score_history
-- New subcategory fields for the 100-point OMS model

-- Academic subcategories
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS adm integer DEFAULT 0;
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS language_cultural integer DEFAULT 0;

-- Leadership subcategories
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS cer_score integer;
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS training_extracurricular integer DEFAULT 0;
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS maturity_responsibility integer DEFAULT 0;
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS recondo boolean DEFAULT false;

-- Physical subcategories (split AFT into fall/spring)
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS fall_aft integer;
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS spring_aft integer;
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS athletics integer DEFAULT 0;

-- OMS total (100-point scale, replaces old total_oml 1000-point)
ALTER TABLE public.score_history ADD COLUMN IF NOT EXISTS total_oms numeric(5,2);
