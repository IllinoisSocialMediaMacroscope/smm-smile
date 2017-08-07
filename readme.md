# Social Media Analytics and Query Tool
![Architecture](/docs/architecture.png)

# Pre-requisit:
1. **Nodejs** installed: https://nodejs.org/en/download/
2. **Python 3** installed: https://www.python.org/downloads/
3. dependency library requirement please see the **Memo.docx** file. Link here :point_right: [Memo](https://github.com/IllinoisSocialMediaMacroscope/analytics-standalone/tree/master/docs/memo.pdf)

# How to Run:
1. Download/or pull this repository to your local disk;
2. Put .env files in the rootDIR, another .env in the graphql directory. Link here: point_right: [googleDrive](https://drive.google.com/drive/folders/0B37hhRXKgRPOZG1MbUdwSEdVNWM)
**Be Careful, sometimes google drive or your operating system will change the ".env" filename into "_env" or "env". Make sure to change it back to ".env" **
3. Using nodejs command line tool (windows) or just use command line (linux), cd into this repo's root directory; Install all the dependency library by typing: **_npm install_**; cd into ./graphql folder to install graphql dependency library by typing **_cd graphql_** and **_npm install_**
4. **TEST** the analytics server by typing **_npm test_**; **_cd graphql_** and **_npm test_** to test graphql server;
5. **RUN** concurrently by typing **_npm start_**

# Port:
1. Analytic tools run on **http://localhost:8080/**
2. GraphQL data server runs on **http://localhost:5050/graphql/**

# WARNING:
1.For safety and developing reason, **.env** files are not included, Please contact me to get a copy
2.Once you get a copy of .env file, make sure the **rootDIR** variable in the file matches your desired destination 
#### email me: _***REMOVED***_

