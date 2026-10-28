-- Replace the video links for the two "Іменник" topics of the Ukrainian full course.
UPDATE materials m
SET url = 'https://youtu.be/KZFwjfPpUSE', updated_at = now()
FROM topics t, courses c
WHERE m.topic_id = t.id
  AND t.course_id = c.id
  AND c.slug = 'ukrainian-full'
  AND m.type = 'video'
  AND t.title ILIKE '%Відміни, групи%';

UPDATE materials m
SET url = 'https://youtu.be/Dy89EmkVGJg', updated_at = now()
FROM topics t, courses c
WHERE m.topic_id = t.id
  AND t.course_id = c.id
  AND c.slug = 'ukrainian-full'
  AND m.type = 'video'
  AND t.title ILIKE '%Відмінювання прізвищ%';
