# Server Management Scripts

This folder contains scripts to start and stop the application server across Linux, macOS, and Windows.

## Linux and macOS

### Start Server

Run the bash script:

```bash
./scripts/start-server.sh
```

This loads environment variables from `.env`, starts Docker Compose in detached mode, and prints the access URL.

### Stop Server

Run the bash script:

```bash
./scripts/stop-server.sh
```

This brings down the Docker Compose containers.

## Windows (PC)

### Start Server

Run the batch file in Command Prompt:

```cmd
scripts\start-server.bat
```

### Stop Server

Run the batch file in Command Prompt:

```cmd
scripts\stop-server.bat
```
