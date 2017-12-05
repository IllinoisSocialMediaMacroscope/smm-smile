import praw
import csv
import argparse
import pandas as pd
import os
import zipfile
import notification as n

def getFolderSize(folder):
    total_size = os.path.getsize(folder)
    for item in os.listdir(folder):
        itempath = os.path.join(folder, item)
        if os.path.isfile(itempath):
            total_size += os.path.getsize(itempath)
        elif os.path.isdir(itempath):
            total_size += getFolderSize(itempath)
    return total_size

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file))

def deletedir(path):
    for root, dirs, files in os.walk(path, topdown=False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))
            
def bfs(submission,id,directory):
    # check size of the current folder

    # expand comments
    submission.comments.replace_more(limit=None)
    comment_queue = submission.comments[:]  # Seed with top-level
    comments_no_order = [['author','body','created_utc','id','link_id',
                        'parent_id', 'score', 'subreddit_display_name','subreddit_name_prefixed','subreddit_id']]
    while comment_queue:
        comment = comment_queue.pop(0)
        comments_no_order.append([str(comment.author),
                                comment.body, comment.created_utc, comment.id, comment.link_id,
                                comment.parent_id, comment.score, comment.subreddit.display_name, 
                                comment.subreddit_name_prefixed, comment.subreddit_id])
        comment_queue.extend(comment.replies)
    
    
    # save to csv
    with open( DIR + '/' + id + '.csv','w',newline="",encoding='utf-8') as f:
        writer = csv.writer(f, delimiter=',')
        for c in comments_no_order:
            try:
                writer.writerow(c)
            except:
                print('encoding error')

    MB = getFolderSize(DIR)
    if MB >= 400*1024*1024: # 400 MB
        return False
    else:
        return True

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--filename', required=True)
    parser.add_argument('--email',required=True)
    args = parser.parse_args()

    # load url and id
    Array = []
    try:
        with open(args.filename,'r',encoding='utf-8') as f:
            reader = csv.reader(f)
            try:
                for row in reader:
                    Array.append(row)
            except Exception as e:
                pass

    except:
        with open(args.filename,'r',encoding="ISO-8859-1") as f:
            reader = csv.reader(f)
            try:
                for row in reader:
                    Array.append(row)
            except Exception as e:
                pass
    
    df = pd.DataFrame(Array[1:],columns=Array[0])
    headers = df.columns.values.tolist()
    if 'permalink' in headers and 'id' in headers:
        urls = df['permalink'].dropna().astype('str').tolist()
        ids = df['id'].dropna().astype('str').tolist()
    elif '_source.permalink' in headers and '_source.id' in headers:
        urls = df['_source.permalink'].dropna().astype('str').tolist()
        ids = df['_source.id'].dropna().astype('str').tolist()
    else:
        n.notification(args.email,case=0,filename='')
        exit(code='Incomplete information')

    # praw construct submission           
    reddit = praw.Reddit(user_agent='Comment Extraction (by /u/USERNAME)',
                         client_id='***REMOVED***', client_secret="***REMOVED***")

    # configure output directory
    DIR = args.filename[:-4] + '-comments'
    if not os.path.exists(DIR):
        os.makedirs(DIR)

    # loop through the id and store their comments
    for url,id in zip(urls,ids):
        url = "https://www.reddit.com" + url
        submission = reddit.submission(url=url)
        if not bfs(submission,id,DIR):
            # zip goes here
            zipf = zipfile.ZipFile(DIR + '.zip', 'w', zipfile.ZIP_DEFLATED)
            zipdir(DIR + '/', zipf)
            zipf.close()
            
            # delete the files
            deletedir(DIR)
            
            # send out email notification
            n.notification(args.email,case=1,filename=args.filename)
            exit(code='Lack of disk space')

    # success and send email notification
    # zip goes here
    zipf = zipfile.ZipFile(DIR + '.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir(DIR + '/', zipf)
    zipf.close()
            
    # delete the files
    deletedir(DIR)
    
    n.notification(args.email,case=2,filename=args.filename)
    
   
