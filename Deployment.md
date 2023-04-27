# Deployment of SMILE
SMILE can be deployed using Kubernetes clusters. 
For more information about kubernetes, please visit [here](https://kubernetes.io/)

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
Currently, SMILE needs several passwords or secret information to be protected.
If there is any necessity to create one, create a secret.yaml file under smile/templates folder in helm chart, 
then add necessary information in the file.
```angular2svg
---
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "smile.fullname" . }}-server
  labels:
    {{- include "smile.labels" . | nindent 4 }}
stringData:
  MINIO_URL: "smile-minio"
  MINIO_PUBLIC_ACCESS_URL: "Public access URL for the minio"
  REDIS_URL: "redis://smile-redis-master:6379"
  RABBITMQ_URL: "amqp://smile-rabbitmq:5672"
  SMILE_GRAPHQL_URL: "http://smile-graphql:5050/graphql"
  RABBITMQ_HOST: "smile-rabbitmq"
  REDDIT_CALLBACK_URL: "Call back url for REDDIT"
  CILOGON_CLIENT_ID: "CILOGON client ID"
  CILOGON_CLIENT_SECRET: "CILOGON client secret"
  REDDIT_CLIENT_ID: "REDDIT client ID"
  REDDIT_CLIENT_SECRET: "REDDIT client secret"
  BOX_CLIENT_ID: "BOX client ID"
  BOX_CLIENT_SECRET: "BOX client secret"
  DROPBOX_CLIENT_ID: "DROPBOX client ID"
  DROPBOX_CLIENT_SECRET: "DROPBOX client secret"
  GOOGLE_CLIENT_ID: "Google client ID"
  GOOGLE_CLIENT_SECRET: K8m-"Google client secret"
---
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "smile.fullname" . }}-minio-secret
  labels:
    {{- include "smile.labels" . | nindent 4 }}
stringData:
  root-user: "minio root user"
  root-password: "minio root user password"
---
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "smile.fullname" . }}-graphql
  labels:
    {{- include "smile.labels" . | nindent 4 }}
stringData:
  TWITTER_CONSUMER_KEY: "Twitter consumer key"
  TWITTER_CONSUMER_SECRET: Twitter consumer secret
```

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
and regcred.json should contain the credential information about accessing the repository for the containers that are used to SMILE

### Modifying Values
- All the necessary information, such as container name, tags, and other controlling parameters are recorded in values.yaml
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