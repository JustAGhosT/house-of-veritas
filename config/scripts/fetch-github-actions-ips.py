#!/usr/bin/env python3
"""
Fetch GitHub Actions IP ranges from api.github.com/meta, filter for Azure
compatibility (/0-/30 only), and collapse adjacent/overlapping ranges to minimize
count (Azure Key Vault and Storage limit: 1000 rules).

Output: JSON array of CIDR strings to stdout.
"""
import json
import sys
import urllib.request

try:
    import ipaddress
except ImportError:
    print("Error: ipaddress module required (Python 3.3+)", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    try:
        with urllib.request.urlopen("https://api.github.com/meta", timeout=15) as r:
            data = json.loads(r.read().decode())
    except Exception as e:
        print(f"Error fetching api.github.com/meta: {e}", file=sys.stderr)
        sys.exit(1)

    raw = data.get("actions", [])
    if not raw:
        print("Error: no 'actions' key in response", file=sys.stderr)
        sys.exit(1)

    networks = []
    for cidr in raw:
        if not cidr or "/" not in str(cidr) or not str(cidr)[0].isdigit():
            continue
        try:
            net = ipaddress.ip_network(cidr)
            if net.version == 4 and net.prefixlen <= 30:
                networks.append(net)
        except ValueError:
            continue

    collapsed = list(ipaddress.collapse_addresses(networks))
    result = [str(n) for n in collapsed]
    if len(result) > 1000:
        result = result[:1000]
        print("Warning: truncated to 1000 (Azure limit)", file=sys.stderr)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
