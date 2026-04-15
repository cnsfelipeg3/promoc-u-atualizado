-- Reset the Paris video to re-trigger Creatomate composition
-- It already has scenes + narration, just needs composition
UPDATE videos 
SET status = 'compondo_video', 
    video_final_url = NULL,
    erro_detalhes = NULL
WHERE id = 'dc453ff6-3eb4-4f9d-8cfa-72757cbf3e22';