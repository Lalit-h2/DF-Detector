FROM alpine:latest as bp

WORKDIR /app/backend


RUN wget https://go.dev/dl/go1.25.1.linux-amd64.tar.gz && tar -C /usr/local -xzf go1.25.1.linux-amd64.tar.gz
ENV PATH $PATH:/usr/local/go/bin

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o ./cmd ./cmd



FROM alpine:latest 

WORKDIR /app/build

COPY --from=bp /app/backend/cmd /app/build   
COPY --from=bp /app/backend/.env /app/build   

EXPOSE 8000

CMD ["./cmd"]