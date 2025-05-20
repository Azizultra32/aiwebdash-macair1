@echo off
aws --profile assistmd s3 rm s3://armada-assistmd-staging --recursive
aws --profile assistmd s3 cp --recursive ./dist s3://armada-assistmd-staging/
aws --profile assistmd cloudfront create-invalidation --distribution-id E3FH1W6PQK542V --paths "/*"
