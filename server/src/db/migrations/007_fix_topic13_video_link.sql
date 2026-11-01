-- Topic 13 of the Ukrainian full course.
UPDATE materials m
SET url = 'https://youtu.be/zWIRdtcskAM', updated_at = now()
FROM topics t, courses c
WHERE m.topic_id = t.id
  AND t.course_id = c.id
  AND c.slug = 'ukrainian-full'
  AND (m.type = 'video' OR m.url ILIKE '%youtu%')
  AND (t.sort_order = 13 OR t.title ILIKE '13.%');
