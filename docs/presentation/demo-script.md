# FA2 demonstration script

Use this order in the viva. Keep each step short and show the screen that proves it.

## 1. Source control

```powershell
cd smart-campus-devops
git status
git log --oneline
git checkout -b feature/demo-note
git checkout main
```

Point out `frontend/` and `backend/` as separate applications, plus `.github/workflows/ci-cd.yml`.

## 2. Tests

```powershell
cd backend
npm test
cd ../frontend
npm test
```

## 3. Run the application with Docker

From the repository root:

```powershell
docker compose up --build
```

Open `http://localhost:3000`. Submit a request as a student, switch to Admin, and change the status.

## 4. Health and metrics

```powershell
curl.exe http://localhost:5000/api/health
curl.exe http://localhost:5000/metrics
```

## 5. Prometheus and Grafana

- Prometheus targets: `http://localhost:9090/targets`
- Grafana: `http://localhost:3001` (anonymous viewing is enabled; admin password is `admin`)
- Open the **Smart Campus Maintenance** dashboard.
- Refresh the app a few times so the request-rate panel moves.

## 6. GitHub Actions

Open the Actions tab and show the workflow stages: checkout, install, lint, test, build, Docker build, image validation, deployment preparation.

## 7. Kubernetes on Minikube

```powershell
minikube start --cpus=2 --memory=4096 --driver=docker
minikube docker-env --shell powershell | Invoke-Expression
docker build -t smart-campus-backend:local ./backend
docker build -t smart-campus-frontend:local ./frontend
kubectl apply -f devops/kubernetes/namespace.yaml
kubectl apply -f devops/kubernetes/
kubectl get pods -n smart-campus
minikube service frontend -n smart-campus
```

Show a pod becoming Ready, then open the frontend URL Minikube prints.

## 8. Close

Restate the path: GitHub, Actions, build, test, Docker, Kubernetes, application, Prometheus, Grafana.
