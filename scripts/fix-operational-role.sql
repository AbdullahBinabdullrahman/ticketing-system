-- Fix role name from 'operation' to 'operational'
-- This ensures consistency with the codebase

-- Update the role name if it exists as 'operation'
UPDATE roles 
SET name = 'operational', 
    description = 'Operations team member',
    updated_at = NOW()
WHERE name = 'operation' AND is_deleted = false;

-- Verify the change
SELECT id, name, description, created_at 
FROM roles 
WHERE name IN ('admin', 'operational', 'partner', 'customer')
ORDER BY name;



