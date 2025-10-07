FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
RUN pip install --no-cache-dir fastapi uvicorn pydantic

# Copy application files
COPY . .

# Expose port
EXPOSE 8001

# Run the application
CMD ["uvicorn", "ruleAPI:app", "--host", "0.0.0.0", "--port", "8001"]
