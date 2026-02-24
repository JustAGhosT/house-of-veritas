# Security Module

Azure Key Vault for secrets management.

## Deployer IP Whitelisting

The Key Vault `network_acls` block uses `var.deployer_ip_addresses` in `ip_rules` to allow CI runners (or other external deployers) to manage secrets during Terraform apply. When `deployer_ip_addresses` is non-empty, those IPs are added to the firewall.

**Behavior and trade-offs:**

- Ephemeral GitHub Actions runners rotate IPs, so `ip_rules` will change on each run and produce plan diffs.
- Reviewers can ignore these diffs when they only affect `ip_rules` on Key Vault (and Storage).
- The CI workflow clears `deployer_ip` after apply, so prior runner IPs are removed from state.
- **Mitigation options:** Use static CI egress IPs, a self-hosted runner inside the VNet, or manage deployer IPs outside this module.

## Variables

| Name                    | Description                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `deployer_ip_addresses` | List of IP addresses (or CIDR) to whitelist for Key Vault access during provisioning |
| `container_subnet_id`   | Subnet ID for VNet-based access                                                      |
