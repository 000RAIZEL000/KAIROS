#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# create_admin fuera del errexit para no tumbar el build si falla
set +e
python manage.py create_admin
set -e
