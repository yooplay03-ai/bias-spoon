import os

import pymysql


class PyToMySQL:
    def __init__(self):
        self.conn = None
        self.cursor = None

    def connect(self):
        self.conn = pymysql.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=3306,
            user=os.getenv("DB_USERNAME", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database="bias_analysisdb",
            charset="utf8mb4",
        )
        self.cursor = self.conn.cursor()

    def insert_data(self, table, uuid, data, title=None, login_id=None):
        try:
            if self.conn is None or not self.conn.open:
                self.connect()
            with self.conn.cursor() as cursor:
                if table == "scraped_raw_data":
                    sql = f"INSERT INTO {table} (uuid, title, data, login_id, created_at) VALUES (%s, %s, %s, %s, now())"
                    cursor.execute(sql, (uuid, title, data, login_id))
                else:
                    if title is None:
                        sql = f"INSERT INTO {table} (uuid, data, created_at) VALUES (%s, %s, now())"
                        cursor.execute(sql, (uuid, data))
                    else:
                        sql = f"INSERT INTO {table} (uuid, title, data, created_at) VALUES (%s, %s, %s, now())"
                        cursor.execute(sql, (uuid, title, data))

            self.conn.commit()
            print(f"Data inserted successfully.: {table}, {uuid}")
        except Exception as e:
            if self.conn:
                self.conn.rollback()
            print(e)
