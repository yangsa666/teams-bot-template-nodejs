# Build and run the app via docker compose (Linux)
1. Run `cp .env.sample .env`
2. Edit `.env` file to fill required information
3. Edit `docker-compose.yml` to give the initial MongoDB username and password. It should be same as the value of `DB_USER` and `DB_PASSWORD` in `.env` file.
1. Run `docker-compose build --no-cache`
2. Run `docker-compose up -d`