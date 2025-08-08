#!/bin/bash

# MVP Blocks App Server Management Script
PROJECT_DIR="/Users/karmanverma/projects/stelos-ai/mvp-blocks-app"
PID_FILE="$PROJECT_DIR/.server.pid"

cd "$PROJECT_DIR"

case "$1" in
  start)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "Server is already running (PID: $(cat $PID_FILE))"
      exit 1
    fi
    echo "Starting development server with Turbopack..."
    npm run dev &
    echo $! > "$PID_FILE"
    echo "Server started (PID: $!)"
    echo "Access at: http://localhost:3000"
    ;;
    
  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        kill "$PID"
        rm "$PID_FILE"
        echo "Server stopped (PID: $PID)"
      else
        echo "Server not running"
        rm "$PID_FILE"
      fi
    else
      echo "No PID file found, attempting to kill any running servers..."
      pkill -f "next dev" || pkill -f "node.*3000" || true
      echo "Done"
    fi
    ;;
    
  restart)
    echo "Restarting server..."
    $0 stop
    sleep 2
    $0 start
    ;;
    
  build)
    echo "Building project for production..."
    npm run build
    ;;
    
  prod)
    echo "Starting production server..."
    if [ ! -d ".next" ]; then
      echo "No build found. Building first..."
      npm run build
    fi
    npm run start
    ;;
    
  lint)
    echo "Running ESLint..."
    npm run lint
    ;;
    
  status)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "Development server is running (PID: $(cat $PID_FILE))"
      echo "Access at: http://localhost:3000"
    else
      echo "Development server is not running"
    fi
    ;;
    
  logs)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "Server is running. Press Ctrl+C to stop viewing logs."
      tail -f ~/.npm/_logs/*debug*.log 2>/dev/null || echo "No logs found"
    else
      echo "Server is not running"
    fi
    ;;
    
  clean)
    echo "Cleaning build artifacts..."
    rm -rf .next
    rm -rf node_modules/.cache
    echo "Clean complete"
    ;;
    
  install)
    echo "Installing dependencies..."
    npm install
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|build|prod|lint|status|logs|clean|install}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the development server with Turbopack"
    echo "  stop    - Stop the development server"
    echo "  restart - Restart the development server"
    echo "  build   - Build the project for production"
    echo "  prod    - Start production server (builds if needed)"
    echo "  lint    - Run ESLint code linting"
    echo "  status  - Check if development server is running"
    echo "  logs    - View server logs (if available)"
    echo "  clean   - Clean build artifacts and cache"
    echo "  install - Install npm dependencies"
    exit 1
    ;;
esac