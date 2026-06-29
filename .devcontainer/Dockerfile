FROM mcr.microsoft.com/devcontainers/base:2.0.4-noble

ARG USERNAME=vscode
ARG NVM_VERSION=v0.40.3

ENV NVM_DIR=/home/${USERNAME}/.nvm
ENV BUN_INSTALL=/home/${USERNAME}/.bun

RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends ca-certificates curl unzip xz-utils \
    && rm -rf /var/lib/apt/lists/*

USER ${USERNAME}

# HOURGLASS PATCH: Ona dev containers need nvm-managed Node, Bun, and Codex available on first boot.
RUN mkdir -p "${NVM_DIR}" \
    && curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" | PROFILE=/dev/null bash \
    && . "${NVM_DIR}/nvm.sh" \
    && nvm install --lts \
    && nvm alias default 'lts/*' \
    && npm install -g @openai/codex@latest \
    && npm cache clean --force \
    && curl -fsSL https://bun.sh/install | bash \
    && { \
        echo ''; \
        echo 'export NVM_DIR="$HOME/.nvm"'; \
        echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"'; \
        echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"'; \
        echo 'export BUN_INSTALL="$HOME/.bun"'; \
        echo 'export PATH="$BUN_INSTALL/bin:$PATH"'; \
    } >> "/home/${USERNAME}/.bashrc"
