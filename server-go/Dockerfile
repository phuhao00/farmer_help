# Use official golang image
FROM golang:1.21-alpine

# Install ca-certificates and bash
RUN apk add --no-cache ca-certificates bash

# Set working directory
WORKDIR /app

# Copy everything including vendor directory
COPY . .

# Set permissions for wait-for-it script
RUN chmod +x wait-for-it.sh

# Build the application using vendor directory
RUN go build -mod=vendor -o main .

# Expose port
EXPOSE 8080

# Default command
CMD ["./main"]
