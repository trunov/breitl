FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o auth ./cmd

FROM alpine:latest

COPY --from=builder /app/auth /auth

EXPOSE 3020

CMD ["/auth"]