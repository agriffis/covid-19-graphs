.PHONY: build dev
build dev:
	yarn && yarn $@

.PHONY: staging
staging:
	now

.PHONY: prod
prod:
	now --prod

.PHONY: data
data:
	git submodule update --remote && git commit -m covid-19-data covid-19-data
