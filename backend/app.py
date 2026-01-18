from fastapi import FastAPI , File , UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from classify import classify_df

app = FastAPI()

orgs =[
"*"
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=orgs,
	allow_credentials=True,
	allow_methods=["GET","POST"],
	allow_headers=["*"],
)

@app.get("/test")
def test():
	return {"message":"working"}


@app.post("/upload")
def process_video():
    try:
        classification_result=classify_df()
    except Exception as err:
        print(err)
        return JSONResponse(content={
              "err":str(err.args)
        })
        
    return JSONResponse(content={
			"result": classification_result[1]
			})


if __name__ == "__app__":
	import uvicorn 
	uvicorn.run(app, host="localhost", port=8000)
