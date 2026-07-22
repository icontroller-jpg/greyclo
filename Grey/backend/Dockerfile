FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt .
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/

# Add backend to Python path
ENV PYTHONPATH=/app/backend

# Expose default port
EXPOSE 8000

# Run migrations, create superuser, and start Gunicorn using $PORT
CMD python backend/manage.py migrate && \
    python backend/manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); \
    username='admin'; email='admin@example.com'; password='Admin@123'; \
    User.objects.filter(username=username).exists() or User.objects.create_superuser(username=username, email=email, password=password)" && \
    gunicorn thriftstore_api.wsgi:application --bind 0.0.0.0:$PORT