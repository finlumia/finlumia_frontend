# Script responsavel pela criacao de uma imagem docker almalinux para o projeto da
# finlumia frontend, portanto o objetivo e montar um ambiente de desenvolvimento pronto
# para utilização no projeto Next.js sem a necessidade configurações e instalações de dependências
# A imagem é baseada na imagem oficial do almalinux, que é uma distribuição linux

FROM almalinux:10.1-minimal-20260509

# Instalação de dependências necessárias para o desenvolvimento do projeto,
# como git, tar, wget, curl e shadow-utils.
# python3, make e gcc-c++ são usados por pacotes npm com módulos nativos (node-gyp).
RUN microdnf install -y \
    git tar wget curl \
    shadow-utils \
    python3 make gcc-c++ \
    && microdnf clean all

# Instalação do Node.js 24 LTS via NodeSource (runtime recomendado para Next.js)
RUN curl -fsSL https://rpm.nodesource.com/setup_24.x | bash - && \
    microdnf install -y nodejs && \
    microdnf clean all && \
    rm -rf /var/cache/microdnf

# Definição das variáveis de ambiente do Node.js e Next.js
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV NPM_CONFIG_CACHE=/home/finlumia/.npm

# Instalação do Docker CLI e Buildx plugin para permitir a construção de imagens docker dentro
# do container, o que e util para o desenvolvimento e testes do projeto finlumia,
# alem de facilitar a integracao com o Docker Hub ou outros registries de container.
RUN curl -Lo /etc/yum.repos.d/docker-ce.repo \
    https://download.docker.com/linux/rhel/docker-ce.repo && \
    microdnf install -y docker-ce-cli docker-buildx-plugin && \
    microdnf clean all && \
    rm -rf /var/cache/microdnf

# Limpeza final dos caches para reduzir o tamanho da imagem final
RUN rm -rf \
    # Limpeza dos caches do microdnf e dnf
    /var/cache/microdnf \
    /var/cache/dnf \
    /var/lib/dnf \
    # Limpeza dos repositórios de instalação
    /etc/yum.repos.d/nodesource*.repo \
    /etc/yum.repos.d/docker-ce.repo \
    # Documentações e man pages
    /usr/share/doc \
    /usr/share/man \
    /usr/share/info \
    # Locales desnecessários
    /usr/share/locale \
    # Logs
    /var/log/* \
    # Temporários
    /tmp/* \
    /root/.bash_history

RUN useradd -m -s /bin/bash finlumia \
    && mkdir -p /home/finlumia/.npm /workspace \
    && chown -R finlumia:finlumia /home/finlumia /workspace

WORKDIR /workspace

EXPOSE 3000

CMD ["tail", "-f", "/dev/null"]
