import boto3
import requests

client = boto3.client(
    's3',
    # Hard coded strings as credentials, not recommended.
    aws_access_key_id='***REMOVED***',
    aws_secret_access_key='***REMOVED***'
)

def upload(localpath, remotepath, filename):
    try:
        client.upload_file(localpath + filename, 'macroscope-smile', remotepath + filename)
        return True
    except:
        return False

def createDirectory(DirectoryName):
    client.put_object(Bucket='macroscope-smile', Key=DirectoryName) # must end with a slash

def generate_downloads(remotepath, filename):
    url = client.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': 'macroscope-smile',
                    'Key': remotepath + filename
                },
                ExpiresIn=604800 # one week
    )
    print(url)
    response = requests.get(url)

    return response

def downloadToDisk(filename, localpath, remotepath):
    try:
        with open(localpath + filename, 'wb') as f:
            client.download_fileobj('macroscope-smile', remotepath + filename, f)
        return True
    except:
        return False

def getObject(remoteKey):
    obj = client.get_object(Bucket='macroscope-smile', Key=remoteKey)
    # print(obj['Body'].read())

def putObject(body,remoteKey):
    # bytes or seekable file-like object
    obj = client.put_object(Bucket='macroscope-smile',Body=body, Key=remoteKey)
    print(obj['Body'].read())

def checkExist(remotepath, filename):
    try:
        t = client.head_object(Bucket='macroscope-smile', Key=remotepath+filename)
        return True
        # print(t)
    except:
        return False
    
def listDir(remoteClass):
    objects = client.list_objects(Bucket='macroscope-smile', Prefix=remoteClass, Delimiter='/')
    foldernames = []
    for o in objects.get('CommonPrefixes'):
        foldernames.append(o.get('Prefix'))

    # only return the list of foldernames
    return foldernames


def listFiles(foldernames):
    objects = client.list_objects(Bucket='macroscope-smile', Prefix=foldernames)

    # return rich information about the files
    return objects.get('Contents')
    

if __name__ == '__main__':
    '''
    #createDirectory('macroscope-smile','GraphQL/')
    #createDirectory('macroscope-smile','GraphQL/Twitter-Tweet/')
    
    # ohh sweet no need to create directory at all
    upload('C:/Users/cwang138/Documents/scripts/apisUtilization-master/hubzero-app/www/downloads/NLP/preprocessing/d4d651fd-13e2-4b29-aa5a-47829162095e/',
           'macroscope-smile',
           'local/NLP/preprocessing/d4d651fd-13e2-4b29-aa5a-47829162095e/',
           'config.dat')
    
    print(generate_downloads('macroscope-smile',
                             'local/NLP/preprocessing/d4d651fd-13e2-4b29-aa5a-47829162095e/',
                             'config.dat'))

    print(checkExist('macroscope-smile', 'local/ML/classification/0abb811f-2a27-4ce6-8881-7028eaec9b95/', 'classification_pipeline.pickle'))

    print(listDir('macroscope-smile','local/NLP/preprocessing/'))

    listFiles('macroscope-smile','local/NLP/preprocessing/1127a434-5db4-44f9-9da2-6c60ffe59ba3/')
    downloadToDisk('macroscope-smile', 'amtrak.csv','temp/', 'local/GraphQL/reddit-Search/amtrak/')'''
