import boto3
import requests

client = boto3.client(
    's3',
    # Hard coded strings as credentials, not recommended.
    aws_access_key_id='***REMOVED***',
    aws_secret_access_key='***REMOVED***'
)

def upload(localpath, bucketName, remotepath, filename):
    '''client.upload_file('C:\\Users\\cwang138\\Documents\\work\\analytic-standalone\\www\\public\\bootstrap\\img\\logo\\' +filename,
                   'macroscope-smile',
                   '/'+filename)'''
    try:
        client.upload_file(localpath + filename, bucketName, remotepath + filename)
        return True
    except:
        return False

def createDirectory(bucketName, DirectoryName):
    client.put_object(Bucket=bucketName, Key=DirectoryName) # must end with a slash

def generate_downloads(bucketName, remotepath, filename):
    url = client.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': bucketName,
                    'Key': remotepath + filename
                },
                ExpiresIn=604800 # one week
    )
    print(url)
    response = requests.get(url)

    return response

def downloadToDisk(bucketName, filename, localpath, remotepath):
    try:
        with open(localpath + filename, 'wb') as f:
            client.download_fileobj(bucketName, remotepath + filename, f)
        return True
    except:
        return False
    
def checkExist(bucketName, remotepath, filename):
    try:
        t = client.head_object(Bucket=bucketName, Key=remotepath+filename)
        return True
        # print(t)
    except:
        return False
    
def listDir(bucketName, remoteClass):
    objects = client.list_objects(Bucket=bucketName, Prefix=remoteClass, Delimiter='/')
    foldernames = []
    for o in objects.get('CommonPrefixes'):
        foldernames.append(o.get('Prefix'))

    # only return the list of foldernames
    return foldernames


def listFiles(bucketName, foldernames):
    objects = client.list_objects(Bucket=bucketName, Prefix=foldernames)

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

    print(listDir('macroscope-smile','local/NLP/preprocessing/'))'''

    listFiles('macroscope-smile','local/NLP/preprocessing/1127a434-5db4-44f9-9da2-6c60ffe59ba3/')

