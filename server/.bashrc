echo -n 'loading project config.......'

db() {
    sqlite3 data/database.db \
        -cmd ".read src/db/sql/init/rooms.sql" \
        -cmd ".read src/db/sql/init/devices.sql" \
        -cmd ".read src/db/sql/init/led_strips.sql" \
        -cmd ".output stdout" \
        -cmd ".read src/db/sql/named_queries/get_led_strips.sql" \
}

echo 'done'
