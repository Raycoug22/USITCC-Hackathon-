import pymysql
from creds import Creds

def get_db_connection():
    return pymysql.connect(
        host=Creds.conString,
        user=Creds.userName,
        password=Creds.password,
        database=Creds.dbName,
        cursorclass=pymysql.cursors.DictCursor
    )