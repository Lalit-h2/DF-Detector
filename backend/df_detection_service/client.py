import grpc
from df_detect import classify_pb2, classify_pb2_grpc

channel = grpc.insecure_channel("127.0.0.1:5501")
stub = classify_pb2_grpc.ClassifyStub(channel)

response = stub.ClassifyVideo(
    classify_pb2.ClassifyRequest(video_path="test.mp4")
)

print("Fake:", response.is_fake)
print("Confidence:", response.confidence)