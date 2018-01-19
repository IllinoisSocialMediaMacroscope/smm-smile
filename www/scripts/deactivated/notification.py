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
    # local/NLP/sentiment/xxxxxxxxxxxxxxxxxxxxxxxx/ => [local,nlp,sentiment,xxxx,space]
    # [local, GraphQL, reddit-post, aww, space]
    # 0         1          2        3
    if filename != '':
        fpath = filename.split('/')
        
        if fpath[1] == 'GraphQL':
            fpath[1] == 'Social Media Data'
        elif fpath[1] == 'NLP':
            fpath[1] = 'Nature Language Processing'
        elif fpath[1] == 'ML':
            fpath[1] = 'Machine Learning ML'
        elif fpath[1] == 'NW':
            fpath[1] = 'Network Visualization and Analysis'

        if fpath[2] == 'reddit-Post':
            fpath[2] = 'Subreddit Posts Title'
        elif fpath[2] == 'reddit-Historical-Post':
            fpath[2] = 'Reddit Historical Post'
        elif fpath[2] == 'reddit-Search':
            fpath[2] = 'Reddit Search Posts Title'
        elif fpath[2] == 'sentiment':
            fpath[2] = 'Sentiment Analysis'
        elif fpath[2] == 'preprocessing':
            fpath[2] = 'NLP Preprocessing'
        elif fpath[2] == 'networkx':
            fpath[2] = 'Python NetworkX'
        elif fpath[2] == 'classification':
            fpath[2] = 'Text Classification'
            

    if case == 0:
        html = """
        <html> 
            <head></head>
            <body>
		<div>
                    <h3>Dear user (session """ + fpath[0] + """),</h3>
		    <p>Your Reddit Comment collection has been terminated.</p>
		    <p>We are using the <b>id</b> and <b>permalink</b> from your Reddit Submission dataset
		    to collect comments and replies. It is most likely you have provide an incomplete Reddit Submission dataset missing these two fields.</p>
		    <p>Please try to reproduce the Reddit Submission with <b>id</b> and <b>permalink</b>, or switch to another dataset.</p>
		    <br>
                    <p>Best Regards,</p>
                    <p>Social Media Macroscope - SMILE </p>
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
                                <h3>Dear user (session """ + fpath[0] + """),</h3>
                                <p>Your Reddit Comment collection is exceeding 400 Megabyte, and is terminated due to lack of disk space.</p>
                                <p>You have requested comments and replies for the Reddit Submission (Post):<u>""" + fpath[3] + """</u>. The partial comments we manage to
                                collect and save will be compressed for you in an .zip file named <u>""" + fpath[3] + """-comments.zip</u></p>    
                                <p>In order to download this file, you need to first locate the original submission in the <b>HISTORY</b> page in SMILE. Go to <b>History</b> -->
                                under <b>""" + fpath[1] + """</b> --> click <b>""" + fpath[2] + """</b> --> then find <b>""" + fpath[3] + """</b> --> click <b>VIEW</b> -->
                                in the <b>Overview</b> table under the <b>downloadables</b> column, you will find these comments in a zip file.</p>
                                <br>
                                <p>Best Regards,</p>
                                <p>Social Media Macroscope - SMILE </p>
                            </div>
                    </body>
            </html>"""
        subject = 'Your Reddit Comment collection has been terminated...'
    elif case == 2:
        html = """<html> 
                    <head></head>
                    <body>
                            <div>
                                <h3>Dear user (session """ + fpath[0] + """),</h3>
                                <p>Your Reddit Comment collection is ready for you!</p>
                                <p>You have requested comments and replies for the Reddit Submission (Post):<u>""" + fpath[3] + """</u>. It will be compressed for you in an
                                .zip file named <u>"""+ fpath[3] +"""-comments.zip</u></p>    
                                <p>In order to download this file, you need to first locate the original submission in the <b>HISTORY</b> page in SMILE. Go to <b>History</b> -->
                                under <b>""" + fpath[1] +"""</b> --> click <b>""" + fpath[2] + """</b> --> then find <b>""" + fpath[3] + """</b> --> click <b>VIEW</b> -->
                                in the <b>Overview</b> table under the <b>downloadables</b> column, you will find these comments in a zip file.</p>
                                <br>
                                <p>Best Regards,</p>
                                <p>Social Media Macroscope - SMILE </p>
                            </div>
                    </body>
            </html>"""
        subject = 'Your Reddit Comment collection is completed!'
    elif case == 3:

        for key in output.keys():
            list_html += '<li><a href="' + output[key] + '">' + key + '</a></li>'
            
        html = """<html> 
                    <head></head>
                    <body>
                            <div>
                                <p>Dear user (session ID: """ + fpath[0] + """),</p>
                                <p>Your """ + fpath[2] + """ results are ready for you!</p>
                                <ul>
                                    <li>You can view the visualization and download the results at <b>HISTORY</b> page in SMILE. Go to <b>History</b> -->
                                    under <b>""" + fpath[1] + """</b> tab --> click <b>""" + fpath[2] + """</b> --> then find <b>""" + fpath[3] + """</b> --> click <b>view</b></li>
                                    <li>You can also click the link below to download part of the results:
                                        <ul>""" + list_html + """</ul>
                                    </li>
                                </ul>
                                <br>
                                <p>Best Regards,</p>
                                <p>Social Media Macroscope - SMILE </p>
                            </div>
                    </body>
            </html>"""
        subject = 'Your ' + fpath[2] + ' is completed!'
        
        
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

if __name__ == '__main__':
    output = {}
    notification('***REMOVED***',case=3,filename='local/NLP/sentiment/b10984e0-a716-4913-a9dc-af970d07507e/',output)
