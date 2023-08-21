[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# crm-moleculer-user

## NPM scripts
- `npm run dev` - Start development mode (load all services locally with hot-reload & REPL)
- `npm run build`- Uses typescript to transpile service to javascript
- `npm start` - Start production mode (set `SERVICES` env variable to load certain services) (previous build needed)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint` - Run ESLint
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose