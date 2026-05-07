package grpc_service

import (
	"fmt"
	"log"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	conn                  *grpc.ClientConn
	addr                  string
	successfullyConnected bool = false
)

func init() {
	fmt.Println("grpc connection....")
	createConnection()
	fmt.Println("grpc connected")
}

func createConnection() {
	grpcHost := os.Getenv("GRPC_HOST")
	const grpcPort = "5501"
	addr = fmt.Sprintf("%s:%s", grpcHost, grpcPort)
	var err error
	conn, err = grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Println(err.Error(), err)
		return
	}
	fmt.Println(conn.GetState().String())
	successfullyConnected = true

}
func CloseConnection() {
	if successfullyConnected {
		conn.Close()
		return
	}
	fmt.Println("Client did not connect in the first place")
}
