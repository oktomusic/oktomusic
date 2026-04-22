---
description: OpenID Connect automated client configuration for Oktomusic
---

# OpenID Connect - OpenTofu setup

[OpenTofu](https://opentofu.org) is an open-source IaC (Infrastructure as Code) tool, forked from [Terraform](https://developer.hashicorp.com/terraform).

This guide will show how to automatically create the OpenID client on common OpenID Connect providers.

It will use OpenTofu but should also work with Terraform.

> [!IMPORTANT]
> This example assumes you have your OpenID Connect provider up and running.
>
> You also need to have OpenTofu properly setup, you can follow the [official guide](https://opentofu.org/docs/intro).

## Keycloak

Keycloak provides an official OpenTofu/Terraform provider:

- https://registry.terraform.io/providers/keycloak/keycloak/latest/docs
- https://search.opentofu.org/provider/keycloak/keycloak/latest

You can follow [official instructions](https://search.opentofu.org/provider/keycloak/keycloak/latest#keycloak-setup) to properly connect OpenTofu to Keycloak:

```terraform [oktomusic.tf]
terraform {
  required_providers {
    keycloak = {
      source = "keycloak/keycloak"
      version = "5.7.0"
    }
  }
}

provider "keycloak" {
  # Authentication options
}
```
