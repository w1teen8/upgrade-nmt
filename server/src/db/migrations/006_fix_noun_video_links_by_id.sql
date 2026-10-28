-- Topic 37 = "5. Іменник. Відмінювання прізвищ. Творення імен по батькові."
UPDATE materials
SET url = 'https://youtu.be/Dy89EmkVGJg', updated_at = now()
WHERE topic_id = 37
  AND (type = 'video' OR url ILIKE '%youtu%');

-- The preceding topic in the same course = "4. Іменник. Відміни, групи, відмінювання".
UPDATE materials m
SET url = 'https://youtu.be/KZFwjfPpUSE', updated_at = now()
FROM topics t
WHERE m.topic_id = t.id
  AND (m.type = 'video' OR m.url ILIKE '%youtu%')
  AND t.course_id = (SELECT course_id FROM topics WHERE id = 37)
  AND (
    t.title ILIKE '%Відміни%групи%'
    OR t.sort_order = (SELECT sort_order - 1 FROM topics WHERE id = 37)
  );
