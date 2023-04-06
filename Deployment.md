# Deployment of SMILE
SMILE can be deployed using Kubernetes clusters. 
For more information about kubernetes, pleaes visit [here](https://kubernetes.io/)

## Prerequisite
To deploy SMILE, kubernetes clusters be ready. 
- Deployment can be done by using helm chart, and it can be checkout out from here.
- In this documentation, everything will be explained based on the assumption 
that there is kubrenetes cluster already set up.
- Kuberentes cluster should already have traefik installed.
- There should be kubectl command and helm installed in local machine to deploy SMILE.

### Secrets
There are some protected information that should not be revealed in the public repository.
These information should be kept in the kubernetes secret file. 
Currently, SMILE doesn't use any password of secret to be protected.
If there is any necessity to create one, create a secret.yaml file under smile folder in helm chart, 
then add necessary information in the file.

## Deployment Steps

### Create a name space SMILE
SMILE will be deployed in the namespace of the SMILE so the other packages, 
such as BAE, can also be deployed in the same cluster without hindering each other at all.

Create a name space first by using the following command 
```angular2svg
kubectl create namespace smile
```

### Create a secret for obtaining the containers (optional)
If you need to create a secrete to download the docker images from the repositories that needs the credential,
create a secret using the following command
```angular2svg
kubectl -n smile create secret generic regcred --from-file=.dockerconfigjson=regcred.json --type=kubernetes.io/dockerconfigjson
```
This command will create a secret named regcred from the file regcred.json,
and regcred.json should contain the credential information about accesing the repository for the containers that are used to SMILE

### Modifying Values
- All the necessary information, such as containter name, tags, and other controlling parameters are recorded in values.yaml
- You can directly modify the values in there, 
or you can create a supplementary files that contains the only information that you frequently modify and updates, 
and name it something like values-smile.yaml.
- The information in the values-smile.yaml will override the information in values.yaml when you deploy, 
if you choose to use it. 

### Deployment
Deploy helm chart by following command
```angular2svg
helm upgrade --namespace smile smile . --values values-smile.yaml
```

### Check out the result
After deploying the chart, check the URL to see if smile works correctly from the URL of
https://smile.{server_main_url}