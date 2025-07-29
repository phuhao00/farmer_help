# Use official golang image (non-alpine to avoid git issues)
FROM golang:1.21

# Set working directory
WORKDIR /app/src

# Set Go environment variables
ENV GO111MODULE=on
ENV GOPROXY=https://goproxy.cn,direct
ENV GOSUMDB=sum.golang.google.cn
ENV GIT_TERMINAL_PROMPT=0

# Copy go mod files first for better caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o /app/main .

# Expose port
EXPOSE 8080

# Default command
CMD ["/app/main"]