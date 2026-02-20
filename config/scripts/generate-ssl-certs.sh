#!/bin/bash
# House of Veritas - Self-Signed SSL Certificate Generator
# For local development only - use Let's Encrypt for production

set -e

SSL_DIR="$(dirname "$0")/../nginx/ssl"
DOMAIN_DOCS="docs.houseofveritas.local"
DOMAIN_OPS="ops.houseofveritas.local"

echo "============================================"
echo "House of Veritas - SSL Certificate Generator"
echo "============================================"

# Create SSL directory
mkdir -p "$SSL_DIR"

# Generate private key
echo "Generating private key..."
openssl genrsa -out "$SSL_DIR/key.pem" 2048

# Generate certificate signing request config
cat > "$SSL_DIR/csr.conf" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = ZA
ST = Gauteng
L = Pretoria
O = House of Veritas
OU = IT
CN = houseofveritas.local

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN_DOCS}
DNS.2 = ${DOMAIN_OPS}
DNS.3 = localhost
DNS.4 = *.houseofveritas.local
EOF

# Generate CSR
echo "Generating certificate signing request..."
openssl req -new -key "$SSL_DIR/key.pem" -out "$SSL_DIR/csr.pem" -config "$SSL_DIR/csr.conf"

# Generate self-signed certificate
echo "Generating self-signed certificate..."
openssl x509 -req \
    -days 365 \
    -in "$SSL_DIR/csr.pem" \
    -signkey "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -extfile "$SSL_DIR/csr.conf" \
    -extensions req_ext

# Set permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

# Cleanup
rm -f "$SSL_DIR/csr.pem" "$SSL_DIR/csr.conf"

echo ""
echo "============================================"
echo "SSL certificates generated successfully!"
echo "============================================"
echo ""
echo "Files created:"
echo "  - $SSL_DIR/cert.pem (certificate)"
echo "  - $SSL_DIR/key.pem (private key)"
echo ""
echo "Valid for domains:"
echo "  - ${DOMAIN_DOCS}"
echo "  - ${DOMAIN_OPS}"
echo "  - localhost"
echo ""
echo "Add to /etc/hosts:"
echo "  127.0.0.1 ${DOMAIN_DOCS}"
echo "  127.0.0.1 ${DOMAIN_OPS}"
echo ""
echo "Note: For browsers, you may need to accept the self-signed certificate."
echo "For production, use Let's Encrypt certificates via Azure Key Vault."
