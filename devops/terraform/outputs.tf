output "namespace" {
  value = "smart-campus"
}

output "database_mode" {
  value = var.use_in_cluster_database ? "in-cluster-postgres" : "external-database"
}
