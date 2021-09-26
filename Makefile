.PHONY: dev install lint build

ifeq ($(shell uname),Linux)
  OPEN=xdg-open
else
  OPEN=open
endif

dev:
	$(OPEN) http://localhost:3000 && yarn next dev

install:
	yarn install

lint: install
	yarn next lint

fix/js: install
	$(MAKE) fix/js/prettier
	$(MAKE) fix/js/eslint

fix/js/eslint: install
	yarn eslint "**/*.{ts,tsx}" --fix

fix/js/prettier: install
	yarn prettier --check --write "**/*.{ts,tsx}"

build: install
	yarn next build && yarn next export
