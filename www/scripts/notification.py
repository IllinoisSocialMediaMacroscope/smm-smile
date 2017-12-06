import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def notification(toaddr,case,filename):
    # toaddr -- email address to send to
    # text content to send
    # subject
    host = '***REMOVED***'
    port = '465'
    fromaddr = '***REMOVED***'
    

    # map the fpath component to History panel names
    if filename != '':
        fpath = filename.split('/')
        if fpath[-3] == 'reddit-Post':
            fpath[-3] = 'Subreddit Posts Title'
        elif fpath[-3] == 'reddit-Historical-Post':
            fpath[-3] = 'Reddit Historical Post'
        elif fpath[-3] == 'reddit-Search':
            fpath[-3] = 'Reddit Search Posts Title'

    if case == 0:
        html = """
        <html> 
            <head></head>
            <body>
		<div>
		    <h3>Your Reddit Comment collection has been terminated :-(</h3>
		    <p>We are using the <b>id</b> and <b>permalink</b> from your Reddit Submission dataset
		    to collect comments and replies. It is most likely you have provide an incomplete Reddit Submission dataset missing these two fields.</p>
		    <p>Please try to reproduce the Reddit Submission with <b>id</b> and <b>permalink</b>, or switch to another dataset.</p>
		</div>
            </body>
        </html>
        """
        subject = 'Your Reddit Comment collection has failed...'
    elif case == 1:
        html = """<html> 
                    <head></head>
                    <body>
                            <div>
                                <h3>Your Reddit Comment collection is exceeding 400 Megabyte, and is terminated due to lack of disk space. :-p</h3>
                                <p>You have requested comments and replies for the Reddit Submission (Post):<u>""" + fpath[-1] + """</u>. The partial comments we manage to
                                collect and save will be compressed for you in an .zip file named <u>"""+ fpath[-1][:-4]+"""-comments.zip</u></p>    
                                <p>In order to download this file, you need to first locate the original submission in the <b>HISTORY</b> page in SMILE. Go to <b>History</b> -->
                                under <b>Social Media Data</b> --> click <b>""" + fpath[-3] + """</b> --> then find <b>""" + fpath[-2] + """</b> --> click <b>VIEW</b> -->
                                in the <b>Overview</b> table under the <b>downloadables</b> column, you will find these comments in a zip file.</p>
                            </div>
                    </body>
            </html>"""
        subject = 'Your Reddit Comment collection has been terminated...'
    elif case == 2:
        html = """<html> 
                    <head></head>
                    <body>
                            <div>
                                <h3>Your Reddit Comment collection is ready for you! :-D</h3>
                                <p>You have requested comments and replies for the Reddit Submission (Post):<u>""" + fpath[-1] + """</u>. It will be compressed for you in an
                                .zip file named <u>"""+ fpath[-1][:-4] +"""-comments.zip</u></p>    
                                <p>In order to download this file, you need to first locate the original submission in the <b>HISTORY</b> page in SMILE. Go to <b>History</b> -->
                                under <b>Social Media Data</b> --> click <b>""" + fpath[-3] + """</b> --> then find <b>""" + fpath[-2] + """</b> --> click <b>VIEW</b> -->
                                in the <b>Overview</b> table under the <b>downloadables</b> column, you will find these comments in a zip file.</p>
                            </div>
                    </body>
            </html>"""
        subject = 'Your Reddit Comment collection is completed!'
        
    password = '***REMOVED***'

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = fromaddr
    msg['To'] = toaddr
    msg.attach(MIMEText(html, 'html'))

    server = smtplib.SMTP_SSL(host, port)
    server.login(fromaddr,password)
    server.sendmail(fromaddr, toaddr, msg.as_string())
    server.quit()
