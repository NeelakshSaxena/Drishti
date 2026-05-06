import json
import os
import socket
import sqlite3
from pathlib import Path

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DATABASE_URL = os.getenv("DATABASE_URL")

SQLITE_PATH = BACKEND_DIR / "data" / "drishti.db"

if not SQLITE_PATH.exists():
    raise FileNotFoundError(f"SQLite database not found at {SQLITE_PATH}")

if not DATABASE_URL and (not DB_HOST or not DB_USER or not DB_PASSWORD):
    raise RuntimeError(
        "Set DATABASE_URL or DB_HOST, DB_USER, and DB_PASSWORD in backend/.env or environment variables."
    )


def check_supabase_dns():
    try:
        addrs = socket.getaddrinfo(DB_HOST, DB_PORT, family=socket.AF_UNSPEC, type=socket.SOCK_STREAM)
        addrs = [a[4][0] for a in addrs]
        unique_addrs = sorted(set(addrs))
        print(f"Resolved {DB_HOST} -> {', '.join(unique_addrs)}")
    except Exception as e:
        raise RuntimeError(
            f"Could not resolve DB host {DB_HOST}: {e}. "
            "Check your network/DNS or use a VPN if your current network blocks Supabase."
        )


def get_postgres_conn():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL, sslmode="require", connect_timeout=10)

    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        sslmode="require",
        connect_timeout=10,
    )


def get_sqlite_count(sqlite_conn, table_name):
    cursor = sqlite_conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    return cursor.fetchone()[0]


def get_postgres_count(pg_conn, table_name):
    with pg_conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {table_name}")
        return cur.fetchone()[0]


def migrate_parents(sqlite_conn, pg_conn):
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT id, name, email, password, linked_children, created_at FROM parents")
    rows = cursor.fetchall()
    print(f"Found {len(rows)} parent row(s) in SQLite")

    with pg_conn.cursor() as cur:
        for row in rows:
            cur.execute(
                """
                INSERT INTO parents (id, name, email, password, linked_children, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    password = EXCLUDED.password,
                    linked_children = EXCLUDED.linked_children,
                    created_at = EXCLUDED.created_at
                """,
                row,
            )
    pg_conn.commit()
    print("Parents migrated")


def migrate_children(sqlite_conn, pg_conn):
    cursor = sqlite_conn.cursor()
    cursor.execute(
        "SELECT id, name, email, password, age, child_code, parent_id, current_trip, trip_history, created_at, lat, lon, share_token, share_token_expires_at, is_sharing, location_updated_at FROM children"
    )
    rows = cursor.fetchall()
    print(f"Found {len(rows)} child row(s) in SQLite")

    with pg_conn.cursor() as cur:
        for row in rows:
            cur.execute(
                """
                INSERT INTO children (
                    id, name, email, password, age, child_code, parent_id,
                    current_trip, trip_history, created_at, lat, lon,
                    share_token, share_token_expires_at, is_sharing, location_updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    password = EXCLUDED.password,
                    age = EXCLUDED.age,
                    child_code = EXCLUDED.child_code,
                    parent_id = EXCLUDED.parent_id,
                    current_trip = EXCLUDED.current_trip,
                    trip_history = EXCLUDED.trip_history,
                    created_at = EXCLUDED.created_at,
                    lat = EXCLUDED.lat,
                    lon = EXCLUDED.lon,
                    share_token = EXCLUDED.share_token,
                    share_token_expires_at = EXCLUDED.share_token_expires_at,
                    is_sharing = EXCLUDED.is_sharing,
                    location_updated_at = EXCLUDED.location_updated_at
                """,
                row,
            )
    pg_conn.commit()
    print("Children migrated")


def main():
    print(f"Migrating SQLite data from {SQLITE_PATH} to Supabase PostgreSQL at {DB_HOST}:{DB_PORT}/{DB_NAME}")

    check_supabase_dns()
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    pg_conn = get_postgres_conn()

    try:
        before_parents = get_sqlite_count(sqlite_conn, 'parents')
        before_children = get_sqlite_count(sqlite_conn, 'children')
        print(f"SQLite row counts before migration: parents={before_parents}, children={before_children}")

        migrate_parents(sqlite_conn, pg_conn)
        migrate_children(sqlite_conn, pg_conn)

        after_parents = get_postgres_count(pg_conn, 'parents')
        after_children = get_postgres_count(pg_conn, 'children')
        print(f"Supabase row counts after migration: parents={after_parents}, children={after_children}")

        if before_parents == after_parents and before_children == after_children:
            print("Migration verified: row counts match.")
        else:
            print("Warning: row counts mismatch after migration. Review the database contents.")

        print("Migration complete.")
    finally:
        sqlite_conn.close()
        pg_conn.close()


if __name__ == "__main__":
    main()
