def read_sql_init_file(file_name: str) -> str:
    if not file_name.endswith(".sql"):
        file_name += ".sql"
    with open("src/db/sql/init/" + file_name, 'r') as file:
        sql = file.read()
    return sql
