import os
from os.path import join, dirname
import uuid
import boto3
import json
client = boto3.client('s3')

def lambda_handler(event, context):
    output = []
    
    # arranging the paths
    uid = str(uuid.uuid4())
    awsPath = event['s3FolderName'] + '/NW/networkx/' + uid +'/'
    localSavePath = '/tmp/' + event['s3FolderName'] + '/NW/networkx/' + uid + '/'
    localReadPath = '/tmp/' + event['s3FolderName'] + '/'
    if not os.path.exists(localSavePath):
        os.makedirs(localSavePath)
    if not os.path.exists(localReadPath):
        os.makedirs(localReadPath)
        
    fname = 'config.dat'
    with open(localSavePath + fname,"w") as f:
        json.dump(event,f)
    try:
        client.upload_file(localSavePath + fname, 'macroscope-smile', awsPath + fname)
        output.append('success')
    except:
        return False
        
    return output
