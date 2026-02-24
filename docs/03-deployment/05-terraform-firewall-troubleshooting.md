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

Key Vault and Storage Account use `default_action = "Deny"` with `ip_rules` and `virtual_network_subnet_ids`. Terraform must refresh state first (read Key Vault secrets, Storage containers) before it can apply any changes. The refresh is blocked if the runner's network is not allowed:

1. Terraform refreshes state first
2. The refresh is blocked by the firewall (runner's IP or subnet not in allow list)
3. Terraform never reaches the step that would update firewall rules

**Current setup:** Terraform allows the **runner subnet** via `virtual_network_subnet_ids`. Workflows run on a self-hosted runner in that subnet, so the runner's traffic is allowed. No deployer IP or GitHub Actions IP ranges are used.

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

**Why is the job queued and not running?** Workflows use `runs-on: [self-hosted, azure-vnet-ghost]`. GitHub schedules these jobs only on self-hosted runners with the `azure-vnet-ghost` label; if no matching runner is online and idle, the job stays **queued** and does **not** fall back to GitHub-hosted runners. Check: (1) Runner is registered at HouseOfVeritas → Settings → Actions → Runners and shows Idle; (2) Runner has label `azure-vnet-ghost`; (3) Runner is installed on the phoenixvc listener VM with `GITHUB_REPO_URL` set to the HouseOfVeritas repo.

**Why does terraform-plan skip fork PRs?** The plan job runs on the self-hosted runner (VNet access). To avoid running untrusted fork code in the VNet, the job is restricted to same-repo PRs only (`head.repo.full_name == repository`). Fork PRs are skipped; contributors should open branches in the main repo for plan previews.

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

**"next: not found" on Azure App Service:** The deploy workflow uses Next.js standalone output. After build, `.next/static` and `public` are copied into `.next/standalone/`, and that folder is deployed. The web app startup command is `node server.js` (set in Terraform). If you see "next: not found", ensure the workflow deploys `.next/standalone` (not raw `.next/` + `package.json`) and that `app_command_line = "node server.js"` is set in the webapp module.

**ApplicationGatewayDeprecatedTlsVersionUsedInSslPolicy:** AppGwSslPolicy20150501 (TLS 1.0/1.1) is deprecated as of Aug 2025. The gateway module uses a **static** `ssl_policy` block (always present) with `policy_name = "AppGwSslPolicy20220101"` (TLS 1.2 and 1.3). Do not use a dynamic block—omitting `ssl_policy` lets Azure default to the deprecated policy. Regenerate the plan (`terraform plan -out=tfplan`) before applying. See [Azure TLS retirement](https://aka.ms/appgw-oldtlsversions).

---

## Resource Names (Production Defaults)

- Key Vault: `nl-prod-hov-kv-san`
- Storage Account: `nlprodhovstsan`
- Resource Group: `nl-prod-hov-rg-san`

## Verifying the Fix

After the one-time bootstrap (or for greenfield):

1. Push a change that triggers the Terraform workflow
2. Terraform plan/apply should complete without 403 errors
3. Firewall rules persist (runner subnet)—no ephemeral IP clearing needed
