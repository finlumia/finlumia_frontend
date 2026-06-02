#!/usr/bin/env bash
#
# Gerencia o container frontend (Next.js) via Docker.
# Usa docker/scripts/finlumia_front.Dockerfile (AlmaLinux + Node 24).
# Monta a raiz do repositório em /workspace e expõe a porta 3000.
#
# Uso:
#   ./finlumia.sh -up              Sobe o container (build Next.js + start)
#   ./finlumia.sh -up -Build       Rebuild da imagem Docker e sobe o container
#   ./finlumia.sh -down            Para e remove o container
#   ./finlumia.sh -Shell           Shell no container em execução
#   ./finlumia.sh -Logs            Logs do container
#

set -euo pipefail

NAME="${FINLUMIA_CONTAINER_NAME:-finlumia-front-dev}"
IMAGE="${FINLUMIA_IMAGE:-finlumia-front-dev}"
PORT="${FINLUMIA_PORT:-3000}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKERFILE="${ROOT}/docker/scripts/finlumia_front.Dockerfile"
APP_MOUNT="/workspace"

ACTION=""
FORCE_BUILD=false

usage() {
  cat <<EOF
Uso:
  ./finlumia.sh -up              Sobe o container com build e start (http://localhost:${PORT})
  ./finlumia.sh -up -Build       Rebuild da imagem e sobe o container
  ./finlumia.sh -down            Para e remove o container
  ./finlumia.sh -Shell           Shell no container em execução
  ./finlumia.sh -Logs            Logs do container

Variáveis opcionais:
  FINLUMIA_CONTAINER_NAME  Nome do container (padrão: ${NAME})
  FINLUMIA_IMAGE           Nome da imagem (padrão: ${IMAGE})
  FINLUMIA_PORT            Porta no host (padrão: ${PORT})
EOF
}

parse_args() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 0
  fi

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -up) ACTION="up" ;;
      -down) ACTION="down" ;;
      -Shell) ACTION="shell" ;;
      -Logs) ACTION="logs" ;;
      -Build) FORCE_BUILD=true ;;
      -h|--help) usage; exit 0 ;;
      *)
        echo "Argumento desconhecido: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
    shift
  done

  if [[ -z "$ACTION" ]]; then
    usage
    exit 0
  fi
}

assert_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker não encontrado. Instale o Docker Engine e tente novamente." >&2
    exit 1
  fi

  if ! docker version --format '{{.Server.Version}}' >/dev/null 2>&1; then
    echo "Docker não está acessível. Verifique se o daemon está em execução." >&2
    exit 1
  fi
}

docker_fail() {
  local action="$1"
  echo "Falha ao executar: docker ${action}" >&2
  exit 1
}

image_exists() {
  [[ -n "$(docker images -q "$IMAGE" 2>/dev/null | head -n1)" ]]
}

build_image() {
  if [[ ! -f "$DOCKERFILE" ]]; then
    echo "Dockerfile não encontrado: $DOCKERFILE" >&2
    exit 1
  fi
  echo "Construindo imagem '${IMAGE}' (pode levar alguns minutos na primeira vez)..."
  docker build -f "$DOCKERFILE" -t "$IMAGE" "$ROOT" || docker_fail build
  echo "Imagem '${IMAGE}' pronta."
}

remove_container() {
  if docker ps -aq -f "name=^${NAME}$" 2>/dev/null | grep -q .; then
    echo "Removendo container '${NAME}'..."
    docker rm -f "$NAME" >/dev/null 2>&1 || true
  fi
}

container_running() {
  [[ -n "$(docker ps -q -f "name=^${NAME}$" -f "status=running" 2>/dev/null | head -n1)" ]]
}

env_file_args() {
  if [[ -f "${ROOT}/.env.local" ]]; then
    echo --env-file "${ROOT}/.env.local"
  fi
}

start_up() {
  local env_file
  env_file="$(env_file_args)"

  echo "Subindo container '${NAME}' (npm install → build → start)..."
  # NODE_ENV=production no install omite devDependencies (typescript, @types/*) exigidos pelo next build.
  # NODE_ENV=production no build é obrigatório: com "development" o Next.js falha ao gerar /404 e páginas estáticas.
  # shellcheck disable=SC2086
  docker run -d \
    --name "$NAME" \
    --restart unless-stopped \
    -p "${PORT}:3000" \
    -v "${ROOT}:${APP_MOUNT}" \
    -w "$APP_MOUNT" \
    $env_file \
    -e NEXT_TELEMETRY_DISABLED=1 \
    -e NPM_CONFIG_CACHE=/home/finlumia/.npm \
    "$IMAGE" \
    bash -lc 'npm install --include=dev && NODE_ENV=production npm run build && NODE_ENV=production npm run start -- -H 0.0.0.0 -p 3000' \
    || docker_fail run

  echo ""
  echo "Finlumia frontend no ar: http://localhost:${PORT}"
  echo "Logs: ./finlumia.sh -Logs"
  echo "Parar: ./finlumia.sh -down"
  echo ""
  echo "O build pode levar alguns minutos. Acompanhe com: ./finlumia.sh -Logs"
}

enter_shell() {
  if ! container_running; then
    echo "Container '${NAME}' não está em execução. Execute: ./finlumia.sh -up" >&2
    exit 1
  fi
  docker exec -it -w "$APP_MOUNT" "$NAME" bash
}

show_logs() {
  if ! container_running; then
    echo "Container '${NAME}' não está em execução. Execute: ./finlumia.sh -up" >&2
    exit 1
  fi
  docker logs -f "$NAME"
}

cmd_up() {
  if [[ ! -f "$DOCKERFILE" ]]; then
    echo "Dockerfile não encontrado: $DOCKERFILE" >&2
    exit 1
  fi

  if [[ "$FORCE_BUILD" == true ]] || ! image_exists; then
    build_image
  fi

  if container_running; then
    echo "Container '${NAME}' já está em execução."
    echo "http://localhost:${PORT}"
    exit 0
  fi

  remove_container
  start_up
}

cmd_down() {
  remove_container
  echo "Container '${NAME}' encerrado."
}

main() {
  parse_args "$@"
  assert_docker

  case "$ACTION" in
    up) cmd_up ;;
    down) cmd_down ;;
    shell) enter_shell ;;
    logs) show_logs ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
