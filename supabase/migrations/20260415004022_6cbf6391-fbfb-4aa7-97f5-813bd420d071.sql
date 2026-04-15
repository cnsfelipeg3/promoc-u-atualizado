-- Add new columns
ALTER TABLE promocoes ADD COLUMN IF NOT EXISTS overlay_config JSONB;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS music_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS scene_video_url TEXT;

-- Update video status validation to include new statuses
CREATE OR REPLACE FUNCTION public.validate_video_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status NOT IN ('pendente','gerando_arte','com_arte','gerando_cena','com_cena','gerando_video','com_video','gerando_narracao','com_narracao','compondo_video','pronto','erro') THEN
    RAISE EXCEPTION 'Invalid video status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$function$;