-- Rename 'Code Architecture' to 'Architecture' to match challenge rubric category names.
-- The skills table has a unique constraint on name, so we update the existing row.
UPDATE skills SET name = 'Architecture', category = 'Architecture'
WHERE name = 'Code Architecture';

-- Insert Security skill if it doesn't already exist.
INSERT INTO skills (id, track_id, name, category, created_at)
SELECT 'security_skill_v1', t.id, 'Security', 'Security', now()
FROM tracks t
WHERE t.slug = 'backend'
  AND NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Security');
