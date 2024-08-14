UPDATE `devices`
SET
    `name` = ?,
    `current_ip` = ?,
    `current_port` = ?,
    `on` = ?,
    `brightness` = ?,
    `red` = ?,
    `green` = ?,
    `blue` = ?,
    `connected` = ?
WHERE `mac` = ?;
