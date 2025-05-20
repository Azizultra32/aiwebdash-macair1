@echo off
aws --profile assistmd s3 rm s3://armada-assistmd-web-test --recursive
aws --profile assistmd s3 cp --recursive ./dist s3://armada-assistmd-web-test/
aws --profile assistmd cloudfront create-invalidation --distribution-id E2XEURR9U3Y8ON --paths "/*"
