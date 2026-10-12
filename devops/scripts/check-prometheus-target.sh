#!/usr/bin/env bash
set -euo pipefail

namespace="${1:-smart-campus}"
job="${2:-smart-campus-backend}"
local_port="${PROMETHEUS_LOCAL_PORT:-19090}"

echo "Waiting for the API and Prometheus deployments"
kubectl -n "$namespace" rollout status deployment/postgres --timeout=300s || true
kubectl -n "$namespace" rollout status deployment/backend --timeout=300s
kubectl -n "$namespace" rollout status deployment/prometheus --timeout=300s

kubectl -n "$namespace" port-forward svc/prometheus "${local_port}:9090" >/tmp/prometheus-port-forward.log 2>&1 &
port_forward_pid=$!
cleanup() {
  kill "$port_forward_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT

ready=0
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${local_port}/-/ready" >/dev/null; then
    ready=1
    break
  fi
  sleep 1
done

if [ "$ready" != 1 ]; then
  echo "Prometheus did not open its ready endpoint"
  cat /tmp/prometheus-port-forward.log || true
  exit 1
fi

for _ in $(seq 1 36); do
  health="$(
    curl -fsS "http://127.0.0.1:${local_port}/api/v1/targets" | python3 -c '
import json, sys
job = sys.argv[1]
payload = json.load(sys.stdin)
targets = payload.get("data", {}).get("activeTargets", [])
matched = [item for item in targets if item.get("labels", {}).get("job") == job]
print(matched[0]["health"] if matched else "missing")
' "$job"
  )"
  echo "Prometheus target ${job}: ${health}"
  if [ "$health" = "up" ]; then
    echo "Prometheus target is UP"
    exit 0
  fi
  sleep 5
done

echo "Prometheus target ${job} did not become UP"
curl -fsS "http://127.0.0.1:${local_port}/api/v1/targets" || true
kubectl -n "$namespace" get pods -o wide || true
kubectl -n "$namespace" logs deployment/backend --tail=80 || true
kubectl -n "$namespace" logs deployment/prometheus --tail=40 || true
exit 1
