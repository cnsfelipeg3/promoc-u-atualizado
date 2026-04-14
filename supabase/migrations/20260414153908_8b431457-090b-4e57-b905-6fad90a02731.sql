
-- Add anon policies for config_agentes
CREATE POLICY "Anon can read config" ON public.config_agentes FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update config" ON public.config_agentes FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Add anon policies for promocoes
CREATE POLICY "Anon can read promocoes" ON public.promocoes FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert promocoes" ON public.promocoes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update promocoes" ON public.promocoes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete promocoes" ON public.promocoes FOR DELETE TO anon USING (true);

-- Add anon policies for videos
CREATE POLICY "Anon can read videos" ON public.videos FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert videos" ON public.videos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update videos" ON public.videos FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete videos" ON public.videos FOR DELETE TO anon USING (true);

-- Add anon policies for logs_agentes
CREATE POLICY "Anon can read logs" ON public.logs_agentes FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert logs" ON public.logs_agentes FOR INSERT TO anon WITH CHECK (true);

-- Add anon policies for metricas
CREATE POLICY "Anon can read metricas" ON public.metricas FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert metricas" ON public.metricas FOR INSERT TO anon WITH CHECK (true);
