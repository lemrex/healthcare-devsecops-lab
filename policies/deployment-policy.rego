package main

import future.keywords.in
import future.keywords.if
import future.keywords.contains

# Deny containers running as root
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.securityContext.runAsNonRoot
  msg := sprintf("Container '%s' must set securityContext.runAsNonRoot to true", [container.name])
}

# Deny containers without resource limits
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.resources.limits
  msg := sprintf("Container '%s' must define resource limits (cpu and memory)", [container.name])
}

# Deny containers without resource requests
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.resources.requests
  msg := sprintf("Container '%s' must define resource requests (cpu and memory)", [container.name])
}

# Deny containers without a readiness probe
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.readinessProbe
  msg := sprintf("Container '%s' must define a readinessProbe", [container.name])
}

# Deny containers without a liveness probe
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.livenessProbe
  msg := sprintf("Container '%s' must define a livenessProbe", [container.name])
}

# Deny images using the :latest tag
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  endswith(container.image, ":latest")
  msg := sprintf("Container '%s' must not use the :latest image tag — use a specific version or SHA", [container.name])
}

# Deny privileged containers
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  container.securityContext.privileged == true
  msg := sprintf("Container '%s' must not run in privileged mode", [container.name])
}

# Deny containers that allow privilege escalation
deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  container.securityContext.allowPrivilegeEscalation == true
  msg := sprintf("Container '%s' must set allowPrivilegeEscalation to false", [container.name])
}
