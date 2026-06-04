-- Rename 'Frontend Performance' to 'Performance' to match the rubric category name.
UPDATE skills SET name = 'Performance', category = 'Performance'
WHERE name = 'Frontend Performance';

-- Fix Frontend Testing category to match rubric category name exactly.
UPDATE skills SET category = 'Frontend Testing'
WHERE name = 'Frontend Testing';
