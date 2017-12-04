import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

host = '***REMOVED***'
port = '465'
fromaddr = '***REMOVED***'
toaddrs = ['***REMOVED***','***REMOVED***']
password = '***REMOVED***'
text = "Hi!\nHow are you?\nHere is the link you wanted:\nhttps://www.python.org"

msg = MIMEMultipart('alternative')
msg['Subject'] = "Link"
msg['From'] = fromaddr
msg['To'] = ', '.join(toaddrs)
msg.attach(MIMEText(text, 'plain'))

server = smtplib.SMTP_SSL(host, port)
# server.starttls()  
server.login(fromaddr,password)
server.sendmail(fromaddr, toaddrs, msg.as_string())
server.quit()
print("done")
