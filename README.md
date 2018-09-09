### Instructions on setting up ssh keys for AWS

1. Set up an AWS instance and download the corresponding private key, here we call it `aws.pem`
2. `mv aws.pem ~/.ssh`
3. `chmod 400 ~/.ssh/aws.pem`
4. `` eval `ssh-agent -s` `` for starting `ssh-agent`
5. `ssh-add ~/.ssh/aws.pem` to add the private key
6. Connect by `ssh ubuntu@....aws.net`
7. One may use `no-ip` service to use DNS to connect instead
