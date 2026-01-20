-- Clear the "Ideas" feed by making all current creations private
UPDATE creations SET is_public = false;

-- Alternatively, if you want to DELETE them (careful!):
-- DELETE FROM creations WHERE is_public = true;
