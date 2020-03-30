.PHONY: build dev
build dev:
	yarn && yarn $@

.PHONY: staging
staging:
	now

.PHONY: prod
prod:
	now --prod
