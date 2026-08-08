# Kubernetes Dependency Path

Application traffic and dependency traffic are related but different paths.

```mermaid
flowchart LR
    APIPod["API Pod"] -->|"DNS lookup"| DNS["Cluster DNS"]
    DNS -->|"Service name"| Service["Redis Service"]
    Service --> EndpointSlice["Redis EndpointSlice"]
    EndpointSlice --> RedisPod["Ready Redis Pod"]
    RedisPod --> Redis["Redis process :6379"]
```

## Questions To Ask

```text
Can the API resolve the dependency name?
Does the Service select the expected dependency Pod?
Does the EndpointSlice contain ready endpoints?
Does the targetPort match the dependency container port?
Is the dependency process listening?
Does the application have the correct hostname, port, and credentials?
```
