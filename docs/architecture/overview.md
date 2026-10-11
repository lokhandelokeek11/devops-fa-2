# Architecture

CampusDesk is one web application and one API. They stay in separate folders so each can be built, tested, and containerized on its own. Supabase Postgres stores maintenance requests. Prometheus scrapes the API, and Grafana reads Prometheus.

```text
Developer
  -> GitHub
  -> GitHub Actions
  -> Build and test
  -> Docker images
  -> Kubernetes (Minikube)
  -> CampusDesk
  -> Prometheus
  -> Grafana
```

## Runtime

| Piece | Responsibility | Talks to |
| --- | --- | --- |
| Frontend | Student and admin screens, served by Nginx in containers | Backend through `/api` |
| Backend | REST API, validation, logging, `/metrics` | Supabase Postgres |
| Supabase Postgres | Request records | Backend only |
| Prometheus | Scrapes `GET /metrics` every 15 seconds | Backend |
| Grafana | Dashboard for rate, errors, latency, uptime, CPU, and memory | Prometheus |

The browser never receives the database connection string. In Docker Compose and Kubernetes, Nginx inside the frontend container proxies `/api` and `/metrics` to the `backend` service. Local `npm run dev` can call `http://localhost:5000` directly. That address comes from `VITE_API_URL`.

## Request record

Each maintenance request stores a title, description, category, location, priority, status, resolution notes, the student display name, and timestamps. New requests are `Pending`. Administrators move them through `In Progress`, `Resolved`, or `Rejected`.

## Why the layout stays small

There is no separate auth service, message bus, or machine-learning component. Role switching in the header is enough to demonstrate the student and administrator flows in a college viva. Production authentication would sit in front of the same API.
