#!/bin/bash
# =============================================================================
# LocalStack S3 Initialization Script
# =============================================================================
# This script runs when LocalStack starts and creates the required S3 buckets
# for the SAMGov application.
#
# Buckets created:
#   - samgov-documents: For storing proposal documents, contracts, etc.
#   - samgov-attachments: For opportunity attachments
#   - samgov-exports: For generated reports and exports
# =============================================================================

set -e

echo "Initializing LocalStack S3 buckets..."

# Wait for S3 service to be ready
echo "Waiting for S3 service..."
sleep 5

# Create buckets
awslocal s3 mb s3://samgov-documents
awslocal s3 mb s3://samgov-attachments
awslocal s3 mb s3://samgov-exports

# Set bucket policies for public read on exports (for download links)
awslocal s3api put-bucket-policy --bucket samgov-exports --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::samgov-exports/*"
        }
    ]
}'

# Enable versioning on documents bucket
awslocal s3api put-bucket-versioning \
    --bucket samgov-documents \
    --versioning-configuration Status=Enabled

# List created buckets
echo "Created S3 buckets:"
awslocal s3 ls

echo "LocalStack S3 initialization complete!"
