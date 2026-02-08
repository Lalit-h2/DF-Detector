package grpc_service

import (
	"context"

	pb "github.com/Lalit-h2/DF-Detector/backend/main_service/df_detect"
)

func DetectDeepFake(video_path string) (bool, float32, error) {
	df := pb.NewClassifyClient(conn)
	result, err := df.ClassifyVideo(context.Background(), &pb.ClassifyRequest{VideoPath: video_path})
	if err != nil {
		return false, 0.0, err
	}
	return result.IsFake, result.Confidence, nil
}
