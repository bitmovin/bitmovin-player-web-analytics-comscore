# Meta
projectName = bitmovin-comscore
version = `cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | sed 's/[version:]//g' \
  | tr -d '[[:space:]]'`

# Static
bin = ./node_modules/.bin
COFFEE = coffeescript/register


# ------ test (spec, dot, progress, tap, landing, nyan, min (mocha --reporters))
REPORTER = spec



buildCleanDist: ## Build a clean production version with all the minifications and optimizations
	@ NODE_ENV=develop \
		$(bin)/webpack --config ./build/config-webpack-dist.coffee

develop: ## Start a dev server
	@ NODE_ENV=develop \
		$(bin)/coffee ./build/run-dev-server.coffee

.PHONY: test
test: ## Run tests in node
	@ NODE_ENV=test \
		$(bin)/mocha-webpack \
		--webpack-config ./build/config-webpack-test.coffee \
		--reporter $(REPORTER) \
		"test/**/*.{js,ts,coffee}"

watchAndTest: ## Run tests in node in a watch mode
	@ NODE_ENV=test \
		$(bin)/mocha-webpack \
		--watch \
		--webpack-config ./build/config-webpack-test.coffee \
		--reporter $(REPORTER) \
		"test/**/*.{js,ts,coffee}"

.PHONY: coverage
coverage: ## Run tests and generate coverage report
	@ NODE_ENV=coverage \
		$(bin)/nyc \
		$(bin)/mocha-webpack \
		--webpack-config ./build/config-webpack-test.coffee \
		--reporter $(REPORTER) \
		"test/**/*.{js,ts,coffee}"

showCoverage: ## Launch an http server that will server coverage html
	@ NODE_ENV=coverage \
		$(bin)/http-server \
		-p 9022 ./.tmp/coverage/lcov-report


.PHONY: lint
lint: ## Run test coverage
	@ NODE_ENV=develop \
		$(bin)/tslint \
		-c ./tslint.json \
		--project ./tsconfig.json





# -- Utils
launchInterceptor: ## Start interceptor
	@ NODE_ENV=develop \
		$(bin)/coffee ./build/run-comscore-mock-server.coffee

launchSandbox: ## Start a sandbox with prod build
	@ NODE_ENV=develop \
		$(bin)/coffee ./build/run-sandbox.coffee

# validateProdBuild: ## Prebuild with test files
# 	@ NODE_ENV=develop \
# 		$(bin)/http-server -p 9797 ./dist















# -----------------------------------------------------------
# -----  EVERYTHING BELOW THIS LINE IS NOT IMPORTANT --------
# -----       (Makefile helpers and decoration)      --------
# -----------------------------------------------------------
#
# Decorative Scripts - Do not edit below this line unless you know what it is

.PHONY: help
.DEFAULT_GOAL := help

NO_COLOR    = \033[0m
INDENT      = -30s
BIGINDENT   = -50s
GREEN       = \033[36m
BLUE        = \033[34m
DIM         = \033[2m
YELLOW      = \033[33m

# @printf '$(DIM)Variables$(NO_COLOR):\n'
# @printf "$(DIM)$(BLUE) % $(BIGINDENT)$(NO_COLOR) %s \n" "Secrets folder name:" ./$(secretsFolderName)
help:
	@printf '$(DIM)Commands:$(NO_COLOR)\n'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN) % $(BIGINDENT)$(NO_COLOR) - %s\n", $$1, $$2}'
