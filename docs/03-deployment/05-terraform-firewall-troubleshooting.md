# Terraform Firewall Troubleshooting

## Error: ForbiddenByFirewall / AuthorizationFailure

When Terraform runs in GitHub Actions, you may see:

```
Error: making Read request on Azure KeyVault Secret: StatusCode=403
Message="Client address is not authorized and caller is not a trusted service."
Client address: 135.232.177.170
code="ForbiddenByFirewall"
```

And for Storage:

```
Error: retrieving Container: unexpected status 403
AuthorizationFailure: This request is not authorized to perform this operation.
```

## Root Cause

Key Vault and Storage Account use `default_action = "Deny"` with `ip_rules` and `virtual_network_subnet_ids`. Terraform passes `deployer_ip` (the runner IP) so it can add it to the firewall—but Terraform fails **before** it can apply that change because:

1. Terraform refreshes state first (reads Key Vault secrets, Storage containers)
2. The refresh is blocked by the firewall (runner IP not yet allowed)
3. Terraform never reaches the step that would add the runner IP

## Automated Solution (Current Setup)

The workflows now **automatically fetch GitHub Actions IP ranges** from `api.github.com/meta` and pass them to Terraform as `ci_allowed_ip_ranges`. Terraform applies these to Key Vault and Storage firewalls.

**Greenfield (new deployment):** Works automatically. Terraform creates resources with the GitHub Actions IP ranges in the firewall from the start.

**Brownfield (existing resources locked out):** One-time manual bootstrap:

1. In Azure Portal: Key Vault `nl-prod-hov-kv-san` → Networking → **Allow access from all networks**
2. Storage Account `nlprodhovstsan` → Networking → **Allow access from all networks**
3. Run the Terraform workflow (push to main, or manually trigger terraform-apply)
4. Terraform will update the firewalls to use the GitHub Actions IP ranges and set `default_action = Deny`
5. Future runs work automatically—no more manual steps

## Alternative Options

### Option A: Add GitHub Actions IP Ranges via Script

Add the GitHub Actions IP ranges to Key Vault and Storage so any runner can connect.

**Prerequisite:** Run from a machine that can already reach Key Vault and Storage (e.g. VM in your VNet, or after temporarily allowing "All networks" in the portal).

**Using the helper script:**
```bash
# From a machine with Azure CLI and network access
cd config/scripts
chmod +x add-github-actions-ips-to-azure.sh
./add-github-actions-ips-to-azure.sh --dry-run   # Preview
./add-github-actions-ips-to-azure.sh             # Apply
```

**Manual steps (Azure Portal):**
1. Get the IP ranges: `curl -s https://api.github.com/meta | jq -r '.actions[]' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+'`
2. Key Vault → Networking → Firewall → Add existing IPv4 address ranges
3. Storage Account → Networking → Firewall → Add existing IPv4 address ranges
4. Add each CIDR (the list is large; the script automates this)

### Option B: Self-Hosted Runner in Azure VNet (Recommended Long-Term)

Run a self-hosted GitHub Actions runner on a VM inside your Azure VNet (e.g. in the container subnet). The subnet is already in `virtual_network_subnet_ids`, so no firewall changes are needed.

- [GitHub: Adding self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)
- Place the runner in the same subnet as your containers (`10.0.2.0/24`)

## Resource Names (Production Defaults)

- Key Vault: `nl-prod-hov-kv-san`
- Storage Account: `nlprodhovstsan`
- Resource Group: `nl-prod-hov-rg-san`

## Verifying the Fix

After the one-time bootstrap (or for greenfield):

1. Push a change that triggers the Terraform workflow
2. Terraform plan/apply should complete without 403 errors
3. Firewall rules persist (GitHub Actions IP ranges)—no ephemeral IP clearing needed
