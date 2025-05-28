# RUN GITHUB ACTIONS LOCALLY
run-gha:
	act

# DOCKER COMMANDS
up:
	docker compose up --build
down:
	docker compose down
reload:
	docker compose down && docker compose up --build