-- Add prompt_variations JSONB to promocoes
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS prompt_variations JSONB;

-- Add variation_label to videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS variation_label TEXT;