# Use official golang image
FROM golang:1.21-alpine

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates bash

# Set working directory
WORKDIR /app

# Set Go environment
ENV GO111MODULE=on
ENV GOPROXY=https://proxy.golang.org,direct

# Copy go mod files first for better caching
COPY go.mod go.sum ./

# Clean module cache and download dependencies
RUN go clean -modcache && go mod download

# Copy source code
COPY . .

# Copy and set permissions for wait-for-it script
COPY wait-for-it.sh .
RUN chmod +x wait-for-it.sh

# Build the application
RUN go build -o main .

# Expose port
EXPOSE 8080

# Default command
CMD ["./main"]
