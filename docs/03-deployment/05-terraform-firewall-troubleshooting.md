# Terraform Firewall Troubleshooting

## TL;DR – Key Vault 403 / Storage 403 (AuthorizationFailure)

If you see `Client address is not authorized` or `403 AuthorizationFailure` on Storage containers:

1. **One-time bootstrap:** Azure Portal → Key Vault `nl-prod-hov-kv-san` → Networking → **Allow access from all networks**
2. Azure Portal → Storage Account `nlprodhovstsan` → Networking → **Allow access from all networks**
3. Re-run the Terraform workflow (push or manual trigger)
4. Terraform will apply the correct firewall rules (runner subnet, no deployer IP)
5. Future runs work via the self-hosted runner (in the runner subnet)

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

Terraform uses **runner subnet** (`virtual_network_subnet_ids`) for Key Vault and Storage. Workflows run on a self-hosted runner in that subnet, so no deployer IP or GitHub Actions IP ranges are needed.

**Greenfield (new deployment):** Works if the self-hosted runner is online and the subnet is in the firewall from the start.

**Brownfield (existing resources locked out):** One-time manual bootstrap:

1. In Azure Portal: Key Vault `nl-prod-hov-kv-san` → Networking → **Allow access from all networks**
2. Storage Account `nlprodhovstsan` → Networking → **Allow access from all networks**
3. Run the Terraform workflow (push to main, or manually trigger terraform-apply)
4. Terraform will update the firewalls to use the runner subnet and set `default_action = Deny`
5. Future runs work via the self-hosted runner—no more manual steps

**Note:** If you see `Client address: 172.184.x.x` (or similar 172.128–172.255), the runner is using Azure internal IPs. Terraform already adds 172.128.0.0/9 for Key Vault—but you must run the one-time bootstrap above first so Terraform can apply that change.

**Switching to self-hosted runner:** After removing `deployer_ip` from workflows, the first run may fail with Storage 403 because the old runner IP is being removed and the new runner (self-hosted) may not be in use yet. Run the one-time bootstrap above, then re-run. Once the runner subnet is in the firewall, the self-hosted runner will have access.

**Why isn't the self-hosted runner being used?** Workflows use `runs-on: [self-hosted, azure-vnet-ghost]`. If jobs run on GitHub-hosted instead, check: (1) Runner is registered at HouseOfVeritas → Settings → Actions → Runners and shows Idle; (2) Runner has label `azure-vnet-ghost`; (3) Runner is installed on the phoenixvc listener VM with `GITHUB_REPO_URL` set to the HouseOfVeritas repo. If no matching runner is available, GitHub falls back to hosted runners.

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

- [phoenixvc-actions-runner](https://github.com/phoenixvc/phoenixvc-actions-runner) — Self-hosted runner infra (listener VM + VMSS) for phoenixvc org. Deploys into the runner subnet; use `terraform output runner_subnet_id` from HouseOfVeritas.

## Other Terraform Errors (Unrelated to Firewall)

**InvalidIpAddressTypeForNetworkProfile:** Container groups using `subnet_ids` (VNet) must set `ip_address_type = "Private"`. Public IPs are not allowed when a network profile is set. The compute module sets this explicitly.

**Consumption Budget 400 (offerType: None):** Cost Management consumption budgets only support Enterprise Agreement, Web direct, and Microsoft Customer Agreement. Visual Studio / MSDN subscriptions (e.g. MS-AZR-0036P) return `offerType: None` and cannot use `azurerm_consumption_budget_resource_group`. Set `enable_consumption_budget = false` in the monitoring module.

---

## Resource Names (Production Defaults)

- Key Vault: `nl-prod-hov-kv-san`
- Storage Account: `nlprodhovstsan`
- Resource Group: `nl-prod-hov-rg-san`

## Verifying the Fix

After the one-time bootstrap (or for greenfield):

1. Push a change that triggers the Terraform workflow
2. Terraform plan/apply should complete without 403 errors
3. Firewall rules persist (GitHub Actions IP ranges)—no ephemeral IP clearing needed
