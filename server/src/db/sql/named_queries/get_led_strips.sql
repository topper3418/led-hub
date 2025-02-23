SELECT
    d.last_ping,
    COALESCE(d.name, d.mac) as identifier,
    -- r.name as `room`, 
    CASE WHEN ls."on" THEN 'on' ELSE 'off' END as status,
    ls.brightness,
    'rgb(' || ls.red || ',' || ls.green || ',' || ls.blue || ')' AS color,
    ls.num_leds
FROM devices d
LEFT JOIN led_strips ls on d.id = ls.device_id
-- LEFT JOIN rooms r on d.room_id = r.id
ORDER BY d.name;
