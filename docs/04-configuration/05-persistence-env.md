# Persistence Environment Variables

When configured, House of Veritas uses PostgreSQL for audit logs, users, and file upload metadata; Redis for rate limiting; MongoDB for kiosk requests and audit-log fallback; Baserow for time-clock records; and Azure Blob Storage or local disk for uploaded files.

## PostgreSQL (audit_logs, users)

| Variable       | Description                                                  | Example                                                             |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string for House of Veritas app tables | `postgresql://user:pass@host:5432/house_of_veritas?sslmode=require` |
| `POSTGRES_URL` | Alternative to DATABASE_URL                                  | Same format                                                         |

The `house_of_veritas` database is created automatically when using Docker Compose (see `config/docker-compose.yml`). For production, add this database to your Terraform PostgreSQL module.

## Redis (rate limiting)

| Variable    | Description             | Example                            |
| ----------- | ----------------------- | ---------------------------------- |
| `REDIS_URL` | Redis connection string | `redis://:password@localhost:6379` |

When set, rate limiting uses Redis instead of in-memory storage. Redis is already in Docker Compose for Baserow; use the same instance or a dedicated one.

## MongoDB (kiosk requests, audit fallback)

| Variable      | Description                | Example                                      |
| ------------- | -------------------------- | -------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string  | `mongodb://localhost:27017/house_of_veritas` |
| `MONGO_URL`   | Alternative to MONGODB_URI | Same format                                  |

When set, kiosk requests (stock orders, salary advances, issue reports) are stored in MongoDB. When PostgreSQL is not configured, the audit log reads from MongoDB. When MongoDB is unavailable, kiosk uses an in-memory fallback. MongoDB is included in Docker Compose (`config/docker-compose.yml`) and CI/CD (`deploy.yml`).

## Baserow (time-clock persistence)

Time-clock records are persisted to Baserow when `BASEROW_API_URL`, `BASEROW_TOKEN`, and `BASEROW_TABLE_TIME_CLOCK` are configured. See [02-baserow-setup.md](02-baserow-setup.md).

## File/Image Uploads

| API            | Storage                                                               | Metadata                                                          |
| -------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `/api/files`   | Azure Blob (asset-photos, invoice-scans, documents) or `/tmp/uploads` | Returned in response only                                         |
| `/api/uploads` | `/tmp/hov-uploads`                                                    | PostgreSQL `file_uploads` when `DATABASE_URL` set; else in-memory |

**Serving:** Files uploaded via `/api/uploads` are served at `GET /api/uploads/{fileId}`. Files in `/tmp/uploads` (from `/api/files` when Azure not configured) are served at `GET /api/files/serve?category=...&filename=...`.
