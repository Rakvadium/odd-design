FROM node:22-bookworm-slim

ARG BUN_VERSION=1.4.4
ARG CLAUDE_CODE_VERSION=2.1.308
ARG CURSOR_AGENT_VERSION=2026.10.22-27dcf5f

RUN apt-get update \
 && apt-get install -y --no-install-recommends bubblewrap socat ripgrep ca-certificates curl git \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g bun@${BUN_VERSION} @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} \
 && npm cache clean --force

RUN mkdir -p /opt/cursor-agent \
 && curl -fsSL "https://downloads.cursor.com/lab/${CURSOR_AGENT_VERSION}/linux/x64/agent-cli-package.tar.gz" \
  | tar --strip-components=1 -xzf - -C /opt/cursor-agent \
 && ln -s /opt/cursor-agent/cursor-agent /usr/local/bin/cursor-agent

COPY managed-settings.json /etc/claude-code/managed-settings.json

RUN useradd -m app && mkdir -p /work /srv/canary && chown app /work
USER app
WORKDIR /work
