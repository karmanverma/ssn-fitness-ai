#!/bin/bash

PID_FILE=".server.pid"
LOG_FILE="dev.log"

case "$1" in
  start)
    # Check if server is already running
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 $PID 2>/dev/null; then
        echo "Server already running (PID: $PID)"
        echo "Use './dev.sh stop' to stop it first"
        exit 1
      else
        echo "Removing stale PID file"
        rm "$PID_FILE"
      fi
    fi
    echo "Starting development server..."
    npm run dev > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Server started (PID: $!)"
    ;;
  
  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      kill $PID 2>/dev/null
      rm "$PID_FILE"
      echo "Server stopped"
    else
      echo "No server running"
    fi
    ;;
  
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  
  status)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 $PID 2>/dev/null; then
        echo "Server running (PID: $PID)"
      else
        echo "Server not running (stale PID file)"
        rm "$PID_FILE"
      fi
    else
      echo "Server not running"
    fi
    ;;
  
  logs)
    if [ -f "$LOG_FILE" ]; then
      tail -f "$LOG_FILE"
    else
      echo "No log file found"
    fi
    ;;
  
  clear-logs)
    > "$LOG_FILE"
    echo "Logs cleared"
    ;;
  
  build)
    echo "Building application..."
    npm run build > "build.log" 2>&1
    if [ $? -eq 0 ]; then
      echo "Build successful"
    else
      echo "Build failed - check build.log"
      exit 1
    fi
    ;;
  
  build-logs)
    if [ -f "build.log" ]; then
      cat "build.log"
    else
      echo "No build log found"
    fi
    ;;
  
  dev)
    $0 build && $0 start
    ;;
  
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|clear-logs|build|build-logs|dev}"
    exit 1
    ;;
esac