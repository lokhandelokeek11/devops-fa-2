locals {
  kubernetes_dir = "${path.module}/../kubernetes"
  database_url   = var.use_in_cluster_database ? "postgresql://campus:campus@postgres.smart-campus.svc.cluster.local:5432/campus" : var.database_url
  database_ssl   = var.use_in_cluster_database ? "false" : var.database_ssl

  manifest_files = [
    for name in fileset(local.kubernetes_dir, "*.yaml") : name
    if !contains(["namespace.yaml", "backend-secret.yaml"], name)
  ]

  manifest_documents = flatten([
    for name in local.manifest_files : [
      for doc in split("\n---\n", replace(file("${local.kubernetes_dir}/${name}"), "\r\n", "\n")) : yamldecode(doc)
      if trimspace(doc) != ""
    ]
  ])

  manifest_map = {
    for doc in local.manifest_documents : "${doc.kind}/${doc.metadata.name}" => doc
  }
}

resource "terraform_data" "database_url_required" {
  lifecycle {
    precondition {
      condition     = var.use_in_cluster_database || length(var.database_url) > 0
      error_message = "Set database_url to the Supabase URI, or set use_in_cluster_database to true."
    }
  }
}

resource "kubernetes_manifest" "namespace" {
  manifest = yamldecode(file("${local.kubernetes_dir}/namespace.yaml"))
}

resource "kubernetes_secret_v1" "backend" {
  metadata {
    name      = "backend-secret"
    namespace = "smart-campus"
  }

  type = "Opaque"

  data = {
    DATABASE_URL = base64encode(local.database_url)
    DATABASE_SSL = base64encode(local.database_ssl)
  }

  depends_on = [kubernetes_manifest.namespace, terraform_data.database_url_required]
}

resource "kubernetes_manifest" "stack" {
  for_each = local.manifest_map
  manifest = each.value

  depends_on = [
    kubernetes_manifest.namespace,
    kubernetes_secret_v1.backend,
    kubernetes_deployment_v1.postgres,
  ]
}
