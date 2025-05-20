@echo off
aws --profile assistmd s3 rm s3://armada-assistmd-web --recursive
aws --profile assistmd s3 cp --recursive ./dist s3://armada-assistmd-web/
aws --profile assistmd cloudfront create-invalidation --distribution-id E1S53WFEKLZO09 --paths "/*"
