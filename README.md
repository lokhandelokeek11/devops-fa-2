# Smart Campus Maintenance & Service Request System

CampusDesk is a college DevOps project for reporting and managing campus maintenance issues. Students submit requests. Administrators review them, change status and priority, and record how the issue was resolved.

The same repository shows the full delivery path:

```text
Developer -> GitHub -> GitHub Actions -> Build -> Test -> Docker -> Terraform -> Kubernetes -> Application -> Prometheus -> Grafana
```

## 1. Project overview

The system is two applications in one repository:

- `frontend/` is a React interface for students and administrators.
- `backend/` is an Express API backed by Supabase Postgres, with request logging and Prometheus metrics.

Docker Compose runs the API, the web app, Prometheus, and Grafana. The database stays on Supabase. Kubernetes manifests deploy the same application stack on Minikube.

## 2. Problem statement

Students regularly deal with broken classroom equipment, Wi-Fi dropouts, projector faults, lab computers, electrical issues, damaged furniture, and cleanliness problems. Those reports are easy to lose in chat messages. CampusDesk keeps one queue: every request has a location, a category, a priority, and a status that facilities can update.

## 3. Architecture

```text
Browser
  -> Frontend (React, or Nginx in Docker/Kubernetes)
  -> Backend API (Express)
  -> Supabase Postgres

Prometheus scrapes GET /metrics on the backend.
Grafana reads Prometheus.
```

In containers, the browser talks only to the frontend. Nginx proxies `/api` and `/metrics` to the backend service named `backend`. The database connection string stays on the backend. A short architecture note is in [docs/architecture/overview.md](docs/architecture/overview.md).

## 4. Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Lucide |
| Backend | Node.js, Express, TypeScript, Supabase Postgres, Zod, Helmet, CORS, Morgan, prom-client |
| Tests | Vitest, React Testing Library, Jest, Supertest |
| Delivery | Git, GitHub Actions, Docker, Docker Compose, Terraform, Kubernetes, Minikube |
| Observability | Prometheus, Grafana |

## 5. Folder structure

```text
smart-campus-devops/
├── frontend/                 React application
├── backend/                  Express API
├── devops/kubernetes/        Minikube manifests
├── devops/terraform/         Terraform deploy of those manifests
├── devops/monitoring/        Prometheus and Grafana
├── .github/workflows/        CI/CD pipeline
├── docs/                     Architecture, screenshots, viva script
├── docker-compose.yml
└── README.md
```

## 6. Local setup

Install Node.js 22, npm, and Docker Desktop. From this folder:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
cd ../backend
npm install
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead of `Copy-Item`.

## 7. Environment variables

Backend (`backend/.env`):

| Variable | Purpose | Local example |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `NODE_ENV` | Runtime mode | `development` |
| `DATABASE_URL` | Supabase Postgres connection string | `postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:6543/postgres` |
| `DATABASE_SSL` | Use TLS for the database connection | `true` |
| `FRONTEND_URL` | Allowed browser origins, comma-separated | `http://localhost:5173,http://localhost:3000` |

`DATABASE_URL` is required. Copy it from the Supabase dashboard under Project Settings, Database, Connection string, URI. Do not commit a real `.env`. The example contains no real password.

Frontend (`frontend/.env`):

| Variable | Purpose | Local example |
| --- | --- | --- |
| `VITE_API_URL` | API origin used by Axios | `http://localhost:5000` |

Leave `VITE_API_URL` empty for Docker and Kubernetes. The browser then calls `/api` on the same host, and Nginx forwards it to the backend. Vite also proxies `/api` during `npm run dev` when the variable is empty.

## 8. Running the frontend

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173`.

The header switches between Student and Admin. The student name is stored in the browser and saved with each new request, so **My Requests** can show that student's reports. This is a demonstration role switch, not a production login.

## 9. Running the backend

Put the Supabase connection string in `backend/.env`, then:

```powershell
cd backend
npm run dev
```

The API listens on `http://localhost:5000`.

Optional sample data, after `DATABASE_URL` is set:

```powershell
cd backend
npm run seed
```

The seed includes requests for Aisha Khan, Rahul Menon, and Neha Iyer. The default student name in the header is Aisha Khan.

## 10. Supabase Postgres

Create a project at [supabase.com](https://supabase.com). In Project Settings, open Database and copy the URI connection string into `backend/.env` as `DATABASE_URL`.

Use the session pooler URI on port `6543` when it is shown. Set `DATABASE_SSL=true`. The API creates the `requests` table on startup, so you do not need to run a local database.

Supabase dashboard path: Project Settings → Database → Connection string → URI.

## 11. Docker setup

Each application has its own multi-stage Dockerfile.

- The backend image compiles TypeScript, then runs `node dist/server.js` as the `node` user.
- The frontend image builds the Vite app, then serves `dist/` with Nginx.

Build the images from the repository root:

```powershell
docker build -t smart-campus-backend:local ./backend
docker build -t smart-campus-frontend:local ./frontend
```

## 12. Docker Compose

Compose starts the API, the web app, Prometheus, and Grafana. The API reads `DATABASE_URL` from `backend/.env` and connects to Supabase:

```powershell
docker compose up --build
```

| Service | URL |
| --- | --- |
| Web app | http://localhost:3000 |
| API health | http://localhost:5000/api/health |
| Metrics | http://localhost:5000/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

Grafana opens without a login for viewing. The local admin user is `admin` / `admin`. Change that password before using this compose file on a shared machine.

On Windows PowerShell, call `curl.exe` so you do not hit the `Invoke-WebRequest` alias:

```powershell
curl.exe http://localhost:5000/api/health
curl.exe http://localhost:5000/metrics
```

Stop the stack with `docker compose down`.

## 13. Kubernetes setup

Manifests live in `devops/kubernetes/`.

| File | Kind |
| --- | --- |
| `namespace.yaml` | Namespace `smart-campus` |
| `frontend-deployment.yaml`, `frontend-service.yaml` | Web app, NodePort `30080` |
| `backend-deployment.yaml`, `backend-service.yaml` | API, NodePort `30050` |
| `backend-configmap.yaml`, `backend-secret.yaml` | API configuration, including the Supabase connection |
| `prometheus-*`, `grafana-*` | Metrics and the dashboard |

The backend reads `DATABASE_URL` from a Secret and the port, environment, and allowed origin from a ConfigMap. Terraform creates that Secret. Every deployment has readiness and liveness probes plus CPU and memory requests and limits.

`devops/terraform/` is the deploy path. It applies the manifests in `devops/kubernetes/` with the Kubernetes provider. `backend-secret.yaml` stays out of that apply so the Supabase password is not committed. Set `use_in_cluster_database = true` to create Postgres inside the cluster, which is what the CI job does. For a Supabase deploy, copy `terraform.tfvars.example` to `terraform.tfvars` and set `database_url`.

Check the manifests without a cluster. `kubeconform` validates them against the Kubernetes schemas. The CI job runs the same check:

```powershell
docker run --rm -v "${PWD}:/src" -w /src ghcr.io/yannh/kubeconform:v0.6.7 -summary -strict devops/kubernetes
```

After Minikube is running, you can also review what would be created:

```powershell
kubectl apply --dry-run=client -f devops/kubernetes/namespace.yaml
kubectl apply --dry-run=client -f devops/kubernetes/
```

## 14. Minikube deployment

Minikube must see the local images. Build them, load them into Minikube, then let Terraform create the namespace, workloads, and the database Secret.

```powershell
minikube start --cpus=2 --memory=4096 --driver=docker
docker build -t smart-campus-backend:local ./backend
docker build -t smart-campus-frontend:local ./frontend
minikube image load smart-campus-backend:local
minikube image load smart-campus-frontend:local
terraform -chdir=devops/terraform init
terraform -chdir=devops/terraform apply -var "use_in_cluster_database=true"
kubectl get pods -n smart-campus
minikube service frontend -n smart-campus
bash devops/scripts/check-prometheus-target.sh
```

On bash, `terraform -chdir` works the same way. `imagePullPolicy: IfNotPresent` uses the images you loaded. Prometheus reaches the API at `backend.smart-campus.svc.cluster.local:5000`. Grafana uses the in-cluster Prometheus service at `http://prometheus:9090`.

`use_in_cluster_database=true` starts Postgres in the `smart-campus` namespace and points the API at it. To use Supabase instead, apply with `-var "database_url=YOUR_SUPABASE_URI" -var "database_ssl=true"` and leave the in-cluster database off. The check script waits until the `smart-campus-backend` Prometheus target is `up`.

Useful checks:

```powershell
kubectl get svc -n smart-campus
minikube service backend -n smart-campus --url
minikube service grafana -n smart-campus
```

The backend NodePort is there so you can show `/api/health` and `/metrics` during the viva. Requests are stored in Supabase, so the cluster does not run a database pod.

On bash, replace the Docker environment line with:

```bash
eval "$(minikube docker-env)"
```

## 15. Prometheus

`GET /metrics` exposes:

| Metric | Meaning |
| --- | --- |
| `http_requests_total` | Request count by `method`, `route`, and `status_code` |
| `http_request_duration_seconds` | Request latency histogram |
| `http_active_requests` | Requests being handled right now |
| `app_uptime_seconds` | Process uptime |
| `process_cpu_user_seconds_total` | CPU time, from the default Node.js metrics |
| `process_resident_memory_bytes` | Memory, from the default Node.js metrics |

Route labels use the Express path pattern, such as `/api/requests/:id`, so request ids do not create a new time series for every record. Scrapes of `/metrics` are not counted.

- Kubernetes scrape config: `devops/monitoring/prometheus.yml`
- Compose scrape config: `devops/monitoring/prometheus.compose.yml`

Open `http://localhost:9090/targets` after `docker compose up`. The `smart-campus-backend` target should be UP.

## 16. Grafana

The dashboard **Smart Campus Maintenance** shows HTTP requests, request rate, error rate, response time, application uptime, active requests, CPU, and memory.

- Dashboard JSON: `devops/monitoring/grafana/dashboards/smart-campus.json`
- Datasource provisioning: `devops/monitoring/grafana/provisioning/datasources/datasource.yml`

The datasource uid is `prometheus`, which matches the panels. Compose and Kubernetes both provision that datasource automatically.

## 17. Testing

Backend tests cover health, metrics, creating a request, reading it back, validation, and an administrator status update. They use an in-memory Postgres (`pg-mem`), so a separate database is not required.

```powershell
cd backend
npm test
```

Frontend tests cover the student dashboard, the request form, and the request card.

```powershell
cd frontend
npm test
```

`npm run lint` in each app runs the TypeScript compiler in strict mode. `npm run build` produces `frontend/dist` and `backend/dist`.

## 18. CI/CD

`.github/workflows/ci-cd.yml` runs on pushes and pull requests to `main` or `master`:

1. Checkout
2. Install frontend and backend dependencies
3. Frontend lint and test
4. Backend test
5. Frontend build and backend build
6. Docker build
7. Docker image validation
8. Deployment preparation (`docker compose config`, `kubeconform`, and `terraform validate`)
9. Push images when Docker Hub secrets exist
10. Start Minikube, load the images built in this job, and `terraform apply` with Postgres inside the cluster
11. Wait until the Prometheus target `smart-campus-backend` is UP

Secrets, set in the GitHub repository and never in source code:

| Secret | Purpose |
| --- | --- |
| `DOCKERHUB_USERNAME` | Docker Hub account |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

If those secrets are missing, the workflow still passes and prints that the push was skipped. Images are tagged `<username>/smart-campus-frontend:latest` and `<username>/smart-campus-backend:latest`.

## 19. API documentation

Successful JSON uses `success`, `message`, and `data`. Errors use:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "title: Title must be at least 3 characters"
}
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Status, service name, timestamp, uptime, database |
| `GET` | `/api/health/live` | Process liveness, used by Kubernetes |
| `GET` | `/metrics` | Prometheus metrics |
| `GET` | `/api/requests` | List, with optional `status`, `priority`, `category`, `search`, `submittedBy`, `page`, `limit` |
| `GET` | `/api/requests/:id` | One request |
| `POST` | `/api/requests` | Create a request. Status starts as `Pending` |
| `PUT` | `/api/requests/:id` | Update title, description, category, location, or priority |
| `DELETE` | `/api/requests/:id` | Delete a request |
| `GET` | `/api/admin/stats` | Total, pending, in progress, resolved, rejected, and critical counts |
| `PATCH` | `/api/admin/requests/:id/status` | Update status, priority, and resolution notes |

Create body:

```json
{
  "title": "Projector will not turn on",
  "description": "The seminar hall projector stays dark after the remote is used.",
  "category": "Projector",
  "location": "Block A - Seminar Hall",
  "priority": "High",
  "submittedBy": "Aisha Khan"
}
```

Categories: Electrical, Wi-Fi, Computer/Lab, Classroom, Projector, Furniture, Cleanliness, Other.

Priorities: Low, Medium, High, Critical.

Statuses: Pending, In Progress, Resolved, Rejected.

Example checks from PowerShell, with the API running:

```powershell
curl.exe http://localhost:5000/api/health
curl.exe -X POST http://localhost:5000/api/requests -H "Content-Type: application/json" -d "{\"title\":\"Loose socket\",\"description\":\"The wall socket sparks when a charger is plugged in.\",\"category\":\"Electrical\",\"location\":\"Block B - Room 204\",\"priority\":\"Critical\",\"submittedBy\":\"Aisha Khan\"}"
curl.exe http://localhost:5000/api/admin/stats
```

## 20. DevOps workflow

1. Create a feature branch and commit the change.
2. Open a pull request. GitHub Actions installs dependencies, lints, tests, and builds both apps.
3. The same workflow builds Docker images and checks that the backend module loads and the frontend responds.
4. It validates Compose, the Kubernetes manifests, and the Terraform configuration.
5. On a push to `main`, it pushes images when Docker Hub secrets are configured.
6. It starts Minikube and deploys the stack with Terraform, including an in-cluster Postgres for that run.
7. It confirms the Prometheus target is UP, then you can open the app and Grafana.

Suggested Git commands:

```powershell
git checkout -b feature/maintenance-queue
git add .
git commit -m "Describe the change"
git push -u origin feature/maintenance-queue
```

A viva walkthrough is in [docs/presentation/demo-script.md](docs/presentation/demo-script.md).

## Application routes

| Path | Screen |
| --- | --- |
| `/` | Project introduction |
| `/dashboard` | Student dashboard |
| `/requests/new` | Create a request |
| `/requests` | My requests |
| `/requests/:id` | Request details |
| `/admin` | Admin dashboard |
| `/admin/requests` | Search, filter, update, and delete requests |

## Security notes

Helmet, CORS, Zod validation, and one error handler protect the API. Logs include the timestamp, method, route, status, and response time. They do not include passwords, tokens, or the database connection string. Secrets belong in `.env` locally and in Kubernetes Secrets or GitHub Secrets when deployed.
