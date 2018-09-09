### Instructions on setting up ssh keys for AWS

1. Set up an AWS instance and download the corresponding private key, here we call it `aws.pem`
2. `mv aws.pem ~/.ssh`
3. `chmod 400 ~/.ssh/aws.pem`
4. `` eval `ssh-agent -s` `` for starting `ssh-agent`
5. `ssh-add ~/.ssh/aws.pem` to add the private key
6. Connect by `ssh ubuntu@....aws.net`
7. (Optional) Use `no-ip` service to use DNS to connect instead
8. (Optional) Add step 4 and 5 to `~/.bashrc` or `~/.zshrc` to load keys upon booting

### Instructions on setting up remote git repo in AWS

#### Setups in AWS

1. `mkdir my_project.git && cd my_project.git`
2. `git init --bare`
3. `mkdir ../my_project`
4. `cd hooks && touch post-receive`
5. Add the followings into `post-receive`
   ```sh
   #!bin/sh
   GIT_WORK_TREE=~/my_project git checkout -f
   # Can add more scripts to run in aws after receiving git push
   ```
6. `chmod +x post-receive`

#### Setups in local

1. `git remote add aws ubuntu@....aws.net`
2. `git config --global remote.aws.receivepack "git receive-pack"`
3. Push by `git push aws`

### Instructions on setting up auto deploy in AWS after `git push`

1. Install `pm2` by `npm i -g pm2`
2. Append the following to `post-receive`
   ```sh
   npm install \
   && npm run build \
   && (pm2 delete 'my-app' || true) \
   && pm2 start npm --name 'my-app' -- start
   ```
