.PHONY: dev install lint build

dev:
	yarn next dev

install:
	yarn install

lint: install
	yarn next lint

build: install
	yarn next build && yarn next export
