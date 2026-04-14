-- Add new columns for AI-generated prompts
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS art_prompt TEXT;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS video_prompt TEXT;
ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS narration_script TEXT;

-- Update status validation to include prompts_gerados
CREATE OR REPLACE FUNCTION public.validate_promocao_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status NOT IN ('pendente','precificada','aprovada','rejeitada','prompts_gerados','em_producao','video_pronto','publicada','arquivada') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$function$;

-- Insert config for new agent
INSERT INTO public.config_agentes (agente, ativo, config)
VALUES ('promptengineer', true, '{"modelo": "claude-sonnet-4-20250514"}'::jsonb)
ON CONFLICT DO NOTHING;