package main

import future.keywords.if
import future.keywords.contains

# Deny namespaces without labels
deny contains msg if {
  input.kind == "Namespace"
  not input.metadata.labels
  msg := sprintf("Namespace '%s' must have labels for identification and policy enforcement", [input.metadata.name])
}

# Deny deploying to the default namespace
deny contains msg if {
  input.kind == "Deployment"
  input.metadata.namespace == "default"
  msg := "Deployments must not use the 'default' namespace — use a dedicated namespace"
}
