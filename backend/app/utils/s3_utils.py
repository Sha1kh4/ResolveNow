import boto3
import uuid
from app.config.settings import settings


s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region,
)


def upload_file(file, filename: str) -> str:
    s3.upload_fileobj(file, settings.s3_bucket_name, filename)

    return (
        f"https://{settings.s3_bucket_name}.s3."
        f"{settings.aws_region}.amazonaws.com/{filename}"
    )


def generate_filename(original_filename: str) -> str:
    return f"{uuid.uuid4()}_{original_filename}"
