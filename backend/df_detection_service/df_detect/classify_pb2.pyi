from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class ClassificationResult(_message.Message):
    __slots__ = ["confidence", "is_fake"]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    IS_FAKE_FIELD_NUMBER: _ClassVar[int]
    confidence: float
    is_fake: bool
    def __init__(self, is_fake: bool = ..., confidence: _Optional[float] = ...) -> None: ...

class ClassifyRequest(_message.Message):
    __slots__ = ["video_path"]
    VIDEO_PATH_FIELD_NUMBER: _ClassVar[int]
    video_path: str
    def __init__(self, video_path: _Optional[str] = ...) -> None: ...
