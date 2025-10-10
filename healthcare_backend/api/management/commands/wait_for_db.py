import time
import os
import psycopg2
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    """Django command to wait for database"""

    def handle(self, *args, **options):
        self.stdout.write('Waiting for database...')
        db_conn = None
        max_retries = 30
        retry_count = 0

        while not db_conn and retry_count < max_retries:
            try:
                # Try using Django's database connection
                conn = connections['default']
                conn.ensure_connection()
                db_conn = True
                self.stdout.write(self.style.SUCCESS('Database available!'))
            except OperationalError:
                self.stdout.write(f'Database unavailable, waiting 1 second... (Attempt {retry_count + 1}/{max_retries})')
                time.sleep(1)
                retry_count += 1

        if not db_conn:
            self.stdout.write(self.style.ERROR('Database connection failed after maximum retries'))
            exit(1)
