# House of Veritas - Configuration & Setup Guide

This directory contains all configuration files, scripts, and templates needed to deploy and configure the House of Veritas platform.

## Directory Structure

```
/config
├── docker-compose.yml        # Local development orchestration
├── .env.template             # Environment variable template
├── docuseal/
│   └── README.md             # DocuSeal setup guide
├── baserow/
│   └── README.md             # Baserow setup guide
├── nginx/
│   └── nginx.conf            # Reverse proxy configuration
├── supervisor/
│   └── nextjs.conf           # Supervisor config for Next.js
├── templates/
│   └── document-list.md      # List of 18+ governance documents
└── scripts/
    ├── deployment-checklist.py   # Azure deployment verification
    ├── setup-supervisor.sh       # Supervisor installation script
    ├── init-multi-db.sh          # PostgreSQL multi-database init
    ├── seed-baserow.py           # Data seeding script
    ├── generate-ssl-certs.sh     # Self-signed SSL generator
    ├── azure-function-webhook.py # DocuSeal webhook handler
    └── document-expiry-alert.py  # Daily expiry check function
```

## 🚀 Quick Start

### Run Deployment Checklist

Before deploying, run the checklist to see what's configured and what's missing:

```bash
# Run the deployment checklist
python3 /app/config/scripts/deployment-checklist.py --verbose

# Output as JSON (for CI/CD pipelines)
python3 /app/config/scripts/deployment-checklist.py --json
```

The checklist verifies:
- ✅ Prerequisites (Azure CLI, Terraform, local config)
- ✅ Azure Resources (Resource Group, VNet, Storage, Key Vault, PostgreSQL)
- ✅ Application Services (DocuSeal, Baserow containers)
- ✅ Networking (Application Gateway, DNS, SSL)

### Setup Supervisor (Development Environment)

```bash
# Install supervisor configuration for Next.js
sudo bash /app/config/scripts/setup-supervisor.sh

# Or manually:
sudo cp /app/config/supervisor/nextjs.conf /etc/supervisor/conf.d/
sudo supervisorctl reread && sudo supervisorctl update
sudo supervisorctl start nextjs
```

Useful supervisor commands:
```bash
supervisorctl status nextjs          # Check status
supervisorctl restart nextjs         # Restart service
tail -f /var/log/supervisor/nextjs.out.log  # View logs
tail -f /var/log/supervisor/nextjs.err.log  # View errors
```

### Prerequisites

- Docker & Docker Compose v2.x
- Python 3.9+
- OpenSSL (for SSL certificate generation)

### Step 1: Configure Environment

```bash
# Copy template and edit values
cp .env.template .env
nano .env  # Fill in your values
```

Required values to change:
- `POSTGRES_PASSWORD` - Strong database password
- `DOCUSEAL_SECRET_KEY` - Generate with `openssl rand -hex 64`
- `BASEROW_SECRET_KEY` - Generate with `openssl rand -hex 32`
- `REDIS_PASSWORD` - Strong Redis password
- SMTP credentials (if sending emails)

### Step 2: Generate SSL Certificates

```bash
chmod +x scripts/generate-ssl-certs.sh
./scripts/generate-ssl-certs.sh
```

### Step 3: Add Local DNS Entries

Add to `/etc/hosts`:
```
127.0.0.1 docs.houseofveritas.local
127.0.0.1 ops.houseofveritas.local
```

### Step 4: Start Services

```bash
docker-compose up -d
```

### Step 5: Access Applications

- **DocuSeal:** https://docs.houseofveritas.local (or http://localhost:3001)
- **Baserow:** https://ops.houseofveritas.local (or http://localhost:3002)

### Step 6: Initial Configuration

1. **DocuSeal:** Follow `/config/docuseal/README.md`
2. **Baserow:** Follow `/config/baserow/README.md`

### Step 7: Seed Data (Optional)

After configuring Baserow tables:

```bash
export BASEROW_URL="http://localhost:3002"
export BASEROW_TOKEN="your-api-token"
python scripts/seed-baserow.py
```

## Production Deployment (Azure)

For production deployment on Azure, use the Terraform configuration in `/terraform/`.

### Key Differences from Local

| Component | Local | Production |
|-----------|-------|------------|
| SSL | Self-signed | Let's Encrypt via Key Vault |
| Proxy | Nginx | Azure Application Gateway |
| Database | Docker container | Azure PostgreSQL Flexible |
| Storage | Docker volumes | Azure Blob Storage |
| Secrets | .env file | Azure Key Vault |

### Production Steps

1. Complete Terraform deployment (see `/terraform/DEPLOYMENT.md`)
2. Configure DNS records
3. Upload SSL certificates to Key Vault
4. Deploy DocuSeal and Baserow containers
5. Run initial configuration
6. Seed data
7. Register webhooks
8. Configure Azure Functions

## Configuration Files Reference

### docker-compose.yml

Orchestrates local development environment:
- PostgreSQL 14 with multi-database support
- Redis 7 for Baserow caching
- DocuSeal latest image
- Baserow latest image
- Nginx reverse proxy

### .env.template

Template for all environment variables. Includes:
- Database credentials
- Application secrets
- SMTP configuration
- Azure settings (production)
- API keys

### nginx/nginx.conf

Local reverse proxy configuration:
- SSL termination (self-signed)
- Path-based routing
- Rate limiting
- Security headers
- WebSocket support (Baserow)

## Scripts Reference

### init-multi-db.sh

PostgreSQL initialization script that creates multiple databases from a comma-separated list.

### seed-baserow.py

Python script to populate Baserow with:
- 4 employees (Hans, Charl, Lucky, Irma)
- 10 sample assets
- 18 document expiry records
- 5 sample tasks

**Usage:**
```bash
export BASEROW_URL="your-baserow-url"
export BASEROW_TOKEN="your-api-token"
# Update TABLE_IDS in script
python seed-baserow.py
```

### generate-ssl-certs.sh

Generates self-signed SSL certificates for local development. Creates:
- Private key (key.pem)
- Certificate (cert.pem)

Valid for: `docs.houseofveritas.local`, `ops.houseofveritas.local`, `localhost`

### azure-function-webhook.py

Azure Function to handle DocuSeal webhooks:
- Validates webhook signatures
- Updates employee contract status on signing
- Updates document expiry records
- Creates audit log entries

### document-expiry-alert.py

Azure Function (timer trigger) for daily document expiry checks:
- Runs at 6am daily
- Checks documents expiring in 60/30/7 days
- Sends alerts to responsible parties
- Sends summary to admin (Hans)

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs docuseal
docker-compose logs baserow
docker-compose logs postgres
```

### Database connection errors

```bash
# Verify PostgreSQL is running
docker-compose exec postgres pg_isready

# Check database exists
docker-compose exec postgres psql -U hov_admin -l
```

### SSL certificate issues

```bash
# Regenerate certificates
rm -rf nginx/ssl/*
./scripts/generate-ssl-certs.sh
docker-compose restart nginx
```

### Can't access applications

1. Check containers are running: `docker-compose ps`
2. Check ports aren't in use: `netstat -tulpn | grep -E '3001|3002|80|443'`
3. Check /etc/hosts entries
4. Check firewall rules

## Support

For issues with:
- **DocuSeal:** https://github.com/docusealco/docuseal
- **Baserow:** https://baserow.io/docs
- **House of Veritas:** Contact Hans at hans@houseofveritas.za
