<#
.SYNOPSIS
  Gerencia o container de desenvolvimento frontend (Next.js) via Docker.

.DESCRIPTION
  Usa docker/scripts/finlumia_front.Dockerfile (AlmaLinux + Node 24).
  Monta a raiz do repositório em /workspace e expõe a porta 3000.

.PARAMETER up
  Sobe o container em segundo plano com Next.js (build da imagem se necessário).

.PARAMETER down
  Para e remove o container.

.PARAMETER Build
  Usado com -up: força rebuild da imagem antes de subir.

.PARAMETER Shell
  Abre shell interativa no container em execução.

.PARAMETER Logs
  Acompanha os logs do container (requer container em execução).

.EXAMPLE
  ./finlumia.ps1 -up

.EXAMPLE
  ./finlumia.ps1 -up -Build

.EXAMPLE
  ./finlumia.ps1 -down
#>
[CmdletBinding(DefaultParameterSetName = "Help")]
param(
    [Parameter(ParameterSetName = "Up", Mandatory = $true)]
    [switch]$up,

    [Parameter(ParameterSetName = "Down", Mandatory = $true)]
    [switch]$down,

    [Parameter(ParameterSetName = "Shell", Mandatory = $true)]
    [switch]$Shell,

    [Parameter(ParameterSetName = "Logs", Mandatory = $true)]
    [switch]$Logs,

    [switch]$Build,
    [string]$Name = "finlumia-front-dev",
    [string]$Image = "finlumia-front-dev",
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

# Evita que stderr de comandos docker (ex.: imagem inexistente) pare o script no PowerShell 7+
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}

$Root = $PSScriptRoot
$Dockerfile = Join-Path $Root "docker\scripts\finlumia_front.Dockerfile"
$AppMount = "/workspace"

function Assert-DockerExitCode {
    param(
        [string]$Action
    )
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao executar: docker $Action (codigo $LASTEXITCODE)"
    }
}

function Show-Usage {
    Write-Host @"
Uso:
  ./finlumia.ps1 -up              Sobe o container com Next.js (http://localhost:${Port})
  ./finlumia.ps1 -up -Build       Rebuild da imagem e sobe o container
  ./finlumia.ps1 -down            Para e remove o container
  ./finlumia.ps1 -Shell           Shell no container em execução
  ./finlumia.ps1 -Logs            Logs do container
"@ -ForegroundColor Cyan
}

function Assert-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw "Docker nao encontrado. Instale o Docker Desktop e tente novamente."
    }

    # Confirma que o daemon responde (mais confiavel que $LASTEXITCODE no Windows)
    $serverVersion = docker version --format "{{.Server.Version}}" 2>$null
    if (-not [string]::IsNullOrWhiteSpace($serverVersion)) {
        return
    }

    throw "Docker nao esta acessivel. Verifique se o Docker Desktop esta em execucao."
}

function Test-ImageExists {
    param([string]$ImageName)
    # docker images -q não emite erro no stderr quando a imagem não existe
    $id = docker images -q $ImageName 2>$null | Select-Object -First 1
    return -not [string]::IsNullOrWhiteSpace($id)
}

function Build-FinlumiaImage {
    if (-not (Test-Path $Dockerfile)) {
        throw "Dockerfile nao encontrado: $Dockerfile"
    }
    Write-Host "Construindo imagem '$Image' (pode levar alguns minutos na primeira vez)..." -ForegroundColor Cyan
    docker build -f $Dockerfile -t $Image $Root
    Assert-DockerExitCode -Action "build"
    Write-Host "Imagem '$Image' pronta." -ForegroundColor Green
}

function Remove-FinlumiaContainer {
    $id = docker ps -aq -f "name=^$([regex]::Escape($Name))$" 2>$null | Select-Object -First 1
    if ($id) {
        Write-Host "Removendo container '$Name'..." -ForegroundColor Yellow
        docker rm -f $Name 2>$null | Out-Null
    }
}

function Remove-NodeModulesVolume {
    param([string]$VolumeName)
    try {
        docker volume rm $VolumeName 2>$null | Out-Null
    } catch {
        # Volume ainda nao existia (primeiro build) - nada a remover.
    }
}

function Test-ContainerRunning {
    # docker ps nao falha quando o container ainda nao existe (diferente de docker inspect)
    $id = docker ps -q -f "name=$Name" -f "status=running" 2>$null | Select-Object -First 1
    return -not [string]::IsNullOrWhiteSpace($id)
}

function Start-FinlumiaUp {
    param([string]$NodeModulesVolume)

    $runArgs = @(
        "run",
        "-d",
        "--name", $Name,
        "--add-host", "host.docker.internal:host-gateway",
        "-p", "${Port}:3000",
        "-v", "${Root}:${AppMount}",
        # Volume nomeado sobreposto ao node_modules: evita que o bind mount do
        # Windows (lento para milhares de arquivos pequenos) seja usado para as
        # dependências. Na primeira execução o Docker semeia o volume com o
        # node_modules já instalado na imagem (ver Dockerfile).
        "-v", "${NodeModulesVolume}:${AppMount}/node_modules",
        "-w", $AppMount,
        "-e", "NODE_ENV=development",
        "-e", "NEXT_TELEMETRY_DISABLED=1",
        "-e", "NPM_CONFIG_CACHE=/home/finlumia/.npm",
        # SERVICE_*_URL nao sao fixadas aqui: o Next.js le o .env.local
        # (montado junto com o resto do repo em $AppMount). Se quiser apontar
        # para backends locais em vez de producao, use host.docker.internal
        # no lugar de localhost no .env.local, ja que "localhost" dentro do
        # container aponta para o proprio container, nao para o host.
        $Image,
        "bash", "-lc",
        "npm run dev -- --hostname 0.0.0.0 --port 3000"
    )

    Write-Host "Subindo container '$Name'..." -ForegroundColor Cyan
    docker @runArgs
    Assert-DockerExitCode -Action "run"

    Write-Host ""
    Write-Host "Finlumia frontend no ar: http://localhost:${Port}" -ForegroundColor Green
    Write-Host "Logs: ./finlumia.ps1 -Logs" -ForegroundColor DarkGray
    Write-Host "Parar: ./finlumia.ps1 -down" -ForegroundColor DarkGray
}

function Enter-FinlumiaShell {
    if (-not (Test-ContainerRunning)) {
        throw "Container '$Name' nao esta em execucao. Execute: ./finlumia.ps1 -up"
    }
    docker exec -it -w $AppMount $Name bash
}

function Show-FinlumiaLogs {
    if (-not (Test-ContainerRunning)) {
        throw "Container '$Name' nao esta em execucao. Execute: ./finlumia.ps1 -up"
    }
    docker logs -f $Name
}

Assert-Docker

if ($PSCmdlet.ParameterSetName -eq "Help") {
    Show-Usage
    return
}

if ($down) {
    Remove-FinlumiaContainer
    Write-Host "Container '$Name' encerrado." -ForegroundColor Green
    return
}

if ($Logs) {
    Show-FinlumiaLogs
    return
}

if ($Shell) {
    Enter-FinlumiaShell
    return
}

if ($up) {
    if (-not (Test-Path $Dockerfile)) {
        throw "Dockerfile nao encontrado: $Dockerfile"
    }

    $NodeModulesVolume = "$Image-node-modules"

    $needsBuild = $Build -or -not (Test-ImageExists -ImageName $Image)
    if ($needsBuild) {
        Build-FinlumiaImage
        # Forca o volume a ser re-semeado com o node_modules da imagem nova
        # (o Docker so preenche automaticamente um volume nomeado vazio).
        Remove-NodeModulesVolume -VolumeName $NodeModulesVolume
    }

    if (Test-ContainerRunning) {
        Write-Host "Container '$Name' ja esta em execucao." -ForegroundColor Yellow
        Write-Host "http://localhost:${Port}" -ForegroundColor Green
        return
    }

    Remove-FinlumiaContainer
    Start-FinlumiaUp -NodeModulesVolume $NodeModulesVolume
}
