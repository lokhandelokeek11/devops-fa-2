resource "kubernetes_service_v1" "postgres" {
  count = var.use_in_cluster_database ? 1 : 0

  metadata {
    name      = "postgres"
    namespace = "smart-campus"
    labels = {
      app = "postgres"
    }
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
    }
  }

  depends_on = [kubernetes_manifest.namespace]
}

resource "kubernetes_deployment_v1" "postgres" {
  count = var.use_in_cluster_database ? 1 : 0

  metadata {
    name      = "postgres"
    namespace = "smart-campus"
    labels = {
      app = "postgres"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:16-alpine"

          port {
            container_port = 5432
            name           = "postgres"
          }

          env {
            name  = "POSTGRES_USER"
            value = "campus"
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value = "campus"
          }

          env {
            name  = "POSTGRES_DB"
            value = "campus"
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", "campus", "-d", "campus"]
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 12
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "256Mi"
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_manifest.namespace]
}
