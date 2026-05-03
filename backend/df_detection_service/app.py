import grpc
from concurrent import futures

from df_detect import classify_pb2, classify_pb2_grpc
from video_classify import load_model_once, classify_df

# Loaded once at startup; shared across all gRPC threads (model.eval() + no_grad is thread-safe)
model = None


class Classify(classify_pb2_grpc.ClassifyServicer):
    def ClassifyVideo(self, request, context):
        try:
            confidence, is_fake = classify_df(request.video_path, model)
            print(f"ClassifyVideo – is_fake={is_fake}, confidence={confidence:.4f}")
            return classify_pb2.ClassificationResult(
                is_fake=is_fake,
                confidence=confidence,
            )
        except (FileNotFoundError, ValueError) as exc:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details(str(exc))
            return classify_pb2.ClassificationResult()
        except Exception as exc:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal error: {exc}")
            return classify_pb2.ClassificationResult()


def start_grpc_server():
    global model
    model = load_model_once()

    port   = "5501"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    classify_pb2_grpc.add_ClassifyServicer_to_server(Classify(), server)
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    print(f"gRPC server started – listening on port {port}")
    server.wait_for_termination()


if __name__ == "__main__":
    start_grpc_server()
