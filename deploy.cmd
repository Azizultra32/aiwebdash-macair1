@echo off
aws --profile assistmd s3 rm s3://armada-assistmd-ultra --recursive
aws --profile assistmd s3 cp --recursive ./dist s3://armada-assistmd-ultra/
aws --profile assistmd cloudfront create-invalidation --distribution-id E2YN4UPP88JJ1U --paths "/*"
