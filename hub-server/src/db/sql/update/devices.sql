UPDATE `devices`
SET
    `name` = ?,
    `current_ip` = ?,
    `on` = ?,
    `brightness` = ?,
    `red` = ?,
    `green` = ?,
    `blue` = ?,
    `connected` = ?
WHERE `mac` = ?;
