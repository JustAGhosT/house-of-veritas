# Backend configuration for Terraform state
# Use this file with: terraform init -backend-config="backend.hcl"

resource_group_name  = "rg-houseofveritas-tfstate"
storage_account_name = "sthoveritastfstate"
container_name       = "tfstate"
key                  = "production.terraform.tfstate"
