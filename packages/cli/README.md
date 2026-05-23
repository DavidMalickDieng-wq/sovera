# `@gardia/cli`

The Gardia command-line interface — initialize, deploy, and operate your sovereign data backend.

## Install

```bash
npm install -g @gardia/cli
```

## Usage

```bash
gardia init                       # scaffold gardia.config.json
gardia login                      # az CLI sign-in
gardia db push                    # apply SQL migrations
gardia tenant create acme         # onboard a customer (starter tier)
gardia tenant create acme -t pro  # …or pro / enterprise
gardia functions deploy           # publish all function apps
gardia status                     # list resources in your RG
```

All commands honor `gardia.config.json` at the workspace root. Override per-call with `--rg`, `--tier`, etc.
