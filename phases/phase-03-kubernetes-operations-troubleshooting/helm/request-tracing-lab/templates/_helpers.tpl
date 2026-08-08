{{- define "request-tracing-lab.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "request-tracing-lab.fullname" -}}
{{- printf "%s" (include "request-tracing-lab.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "request-tracing-lab.labels" -}}
app.kubernetes.io/name: {{ include "request-tracing-lab.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end -}}
