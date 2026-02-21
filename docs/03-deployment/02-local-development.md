# Local Development Guide

## Prerequisites

- Docker and Docker Compose v2.x
- Node.js 18+ and Yarn
- Python 3.9+
- OpenSSL (for SSL certificate generation)

## Quick Start

### 1. Configure Environment

```bash
cd config
cp .env.template .env
```

Edit `.env` and set:

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | Database password |
| `DOCUSEAL_SECRET_KEY` | Generate with `openssl rand -hex 64` |
| `BASEROW_SECRET_KEY` | Generate with `openssl rand -hex 32` |
| `REDIS_PASSWORD` | Redis password |

### 2. Generate Local SSL Certificates

```bash
chmod +x config/scripts/generate-ssl-certs.sh
./config/scripts/generate-ssl-certs.sh
```

### 3. Add Local DNS Entries

Add to your hosts file (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1 docs.houseofveritas.local
127.0.0.1 ops.houseofveritas.local
```

### 4. Start Services

```bash
cd config
docker-compose up -d
```

### 5. Access Applications

| Service | URL | Direct Port |
|---------|-----|-------------|
| DocuSeal | https://docs.houseofveritas.local | http://localhost:3001 |
| Baserow | https://ops.houseofveritas.local | http://localhost:3002 |

### 6. Seed Data (Optional)

```bash
export BASEROW_URL="http://localhost:3002"
export BASEROW_TOKEN="your-api-token"
python config/scripts/seed-baserow.py
```

## Docker Compose Services

The `config/docker-compose.yml` orchestrates:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| PostgreSQL | postgres:14 | 5432 | Shared database (docuseal + baserow) |
| Redis | redis:7 | 6379 | Baserow caching |
| DocuSeal | docuseal/docuseal | 3001 | Document signing |
| Baserow | baserow/baserow | 3002 | Operational tracking |
| Nginx | nginx | 80/443 | Reverse proxy with SSL |

## Local vs Production

| Component | Local | Production |
|-----------|-------|------------|
| SSL | Self-signed certificates | Let's Encrypt via Key Vault |
| Proxy | Nginx container | Azure Application Gateway (WAF v2) |
| Database | PostgreSQL Docker container | Azure PostgreSQL Flexible Server |
| Storage | Docker volumes | Azure Blob Storage (GRS) |
| Secrets | `.env` file | Azure Key Vault |
| DNS | `/etc/hosts` entries | Azure DNS zone |
| OCR | Not available locally | Azure Document Intelligence |

## Next.js Development Server

For frontend development without Docker:

```bash
yarn install
yarn dev
```

The dev server runs at `http://localhost:3000` with hot reload.

### Supervisor (Linux)

For persistent process management:

```bash
sudo bash config/scripts/setup-supervisor.sh
supervisorctl status nextjs
```

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `config/scripts/generate-ssl-certs.sh` | Generate self-signed SSL certs for local dev |
| `config/scripts/init-multi-db.sh` | PostgreSQL multi-database initialization |
| `config/scripts/seed-baserow.py` | Populate Baserow with sample data |
| `config/scripts/deployment-checklist.py` | Verify Azure deployment readiness |

## Troubleshooting

### Services won't start

```bash
docker-compose logs docuseal
docker-compose logs baserow
docker-compose logs postgres
```

### Database connection errors

```bash
docker-compose exec postgres pg_isready
docker-compose exec postgres psql -U hov_admin -l
```

### SSL certificate issues

```bash
rm -rf config/nginx/ssl/*
./config/scripts/generate-ssl-certs.sh
docker-compose restart nginx
```

### Port conflicts

Check if ports are already in use:

```powershell
netstat -ano | findstr "3001 3002 80 443"
```
