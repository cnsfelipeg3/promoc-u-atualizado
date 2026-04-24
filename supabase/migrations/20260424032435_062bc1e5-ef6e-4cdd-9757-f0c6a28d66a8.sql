-- Add creative fields to promocoes
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS titulo_video text;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS hooks jsonb;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS text_overlays jsonb;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS cta_text text;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS hashtags jsonb;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS preco_final numeric;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS audio_narracao_url text;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS higgsfield_request_id text;

-- Insert orquestrador config (uses jsonb config column)
INSERT INTO public.config_agentes (agente, ativo, config)
VALUES (
  'orquestrador',
  true,
  jsonb_build_object(
    'margem_padrao', 0,
    'score_auto_aprovacao', 75,
    'intervalo_min', 60,
    'elevenlabs_voice', '21m00Tcm4TlvDq8ikWAM'
  )
)
ON CONFLICT DO NOTHING;

-- Audios bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audios', 'audios', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for audios
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'audios_public_read') THEN
    CREATE POLICY audios_public_read ON storage.objects
      FOR SELECT USING (bucket_id = 'audios');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'audios_service_write') THEN
    CREATE POLICY audios_service_write ON storage.objects
      FOR ALL TO service_role USING (bucket_id = 'audios') WITH CHECK (bucket_id = 'audios');
  END IF;
END $$;