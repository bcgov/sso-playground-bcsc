SHELL := /usr/bin/env bash

NAMESPACE=

.PHONY: install
install:
	helm install auth-playground . -n "${NAMESPACE}" -f values.yaml

.PHONY: upgrade
upgrade:
	helm upgrade --install auth-playground . -n "${NAMESPACE}" -f values.yaml

.PHONY: lint
lint:
	helm upgrade --dry-run --install auth-playground -n "${NAMESPACE}" -f values.yaml

.PHONY: uninstall
uninstall:
	helm uninstall auth-playground -n ${NAMESPACE}

.PHONY: force-install
force-install: uninstall
force-install: install
