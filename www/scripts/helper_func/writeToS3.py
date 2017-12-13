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
                   'socialmediamacroscope-smile',
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

'''def checkExist():
    pass'''


if __name__ == '__main__':
    #createDirectory('socialmediamacroscope-smile','GraphQL/')
    #createDirectory('socialmediamacroscope-smile','GraphQL/Twitter-Tweet/')
    
    # ohh sweet no need to create directory at all
    upload('C:/Users/cwang138/Documents/scripts/apisUtilization-master/hubzero-app/www/downloads/NLP/preprocessing/d4d651fd-13e2-4b29-aa5a-47829162095e/',
           'socialmediamacroscope-smile',
           'local/NLP/preprocessing/d4d651fd-13e2-4b29-aa5a-47829162095e/',
           'config.dat')
    
    print(generate_downloads('socialmediamacroscope-smile',
                             'local/NLP/preprocessing/d4d651fd-13e2-4b29-aa5a-47829162095e/',
                             'config.dat'))


