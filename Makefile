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

build: install
	yarn next build && yarn next export
