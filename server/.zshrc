echo -n 'loading project config.......'

db() {
    local add_quit=false
    
    # Check for -r in any position
    for arg in "$@"; do
        if [[ "$arg" == "-r" ]]; then
            add_quit=true
            break
        fi
    done

    if [[ "$add_quit" == true ]]; then
        # Use heredoc approach that auto-exits when -r is present
        sqlite3 data/database.db <<EOF
.read src/db/sql/init/rooms.sql
.read src/db/sql/init/devices.sql
.read src/db/sql/init/led_strips.sql
.output stdout
.read src/db/sql/named_queries/get_led_strips.sql
EOF
    else
        # Original interactive approach when no -r
        sqlite3 data/database.db \
            -cmd ".read src/db/sql/init/rooms.sql" \
            -cmd ".read src/db/sql/init/devices.sql" \
            -cmd ".read src/db/sql/init/led_strips.sql" \
            -cmd ".output stdout" \
            -cmd ".read src/db/sql/named_queries/get_led_strips.sql"
    fi
}

echo 'done'
