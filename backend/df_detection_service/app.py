import grpc
from df_detect import classify_pb2,classify_pb2_grpc
import grpc
from concurrent import futures
from video_classify import load_model_once,classify_df


model=0

class Classify(classify_pb2_grpc.ClassifyServicer):
    def ClassifyVideo(self,request,context):
        confidence,is_fake=classify_df(request.video_path,model)
        print(confidence,is_fake)
        return classify_pb2.ClassificationResult(is_fake=is_fake,confidence=confidence)
    

def start_grpc_server():
    server=grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    global model
    port="5501"
    model=load_model_once()
    server=grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    classify_pb2_grpc.add_ClassifyServicer_to_server(Classify(),server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print("Server started,listening"+port)
    server.wait_for_termination()


if __name__ == "__main__":
    start_grpc_server()

