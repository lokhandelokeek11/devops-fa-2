variable "kubeconfig_path" {
  type        = string
  default     = "~/.kube/config"
  description = "Kubeconfig for the Minikube cluster."
}

variable "use_in_cluster_database" {
  type        = bool
  default     = false
  description = "Create Postgres in the cluster and point the API at it. The CI deploy uses this so the pipeline does not need the Supabase password."
}

variable "database_url" {
  type        = string
  default     = ""
  sensitive   = true
  description = "Supabase Postgres URI. Required when use_in_cluster_database is false."
}

variable "database_ssl" {
  type        = string
  default     = "true"
  description = "Value of DATABASE_SSL on the API. Forced to false for the in-cluster database."
}
