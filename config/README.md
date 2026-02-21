# Configuration

This directory contains configuration files, scripts, and templates for deploying and running the House of Veritas platform.

## Directory Structure

```
config/
├── docker-compose.yml           Local development orchestration
├── .env.template                Environment variable template
├── docuseal/                    DocuSeal configuration files
├── baserow/                     Baserow configuration files
├── azure-functions/             Azure Functions (Python)
├── nginx/                       Reverse proxy configuration
├── supervisor/                  Process management
└── scripts/                     Deployment and utility scripts
```

## Documentation

- [Local Development Guide](../docs/03-deployment/02-local-development.md)
- [DocuSeal Setup](../docs/04-configuration/01-docuseal-setup.md)
- [Baserow Setup](../docs/04-configuration/02-baserow-setup.md)
- [Azure Functions](../docs/04-configuration/03-azure-functions.md)
- [Document Templates](../docs/04-configuration/04-document-templates.md)
