[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
## SMILE (Social Media Intelligence and Learning Environment)
![Architecture](/docs/report.png)

## Pre-requisit:
1. **Nodejs** installed: https://nodejs.org/en/download/
2. **Python 3** installed: https://www.python.org/downloads/ 


## How to Run:
1. Download/or pull this repository to your local disk. 
2. ```cd into the pulled repository```. Install the dependency libraries by runnig the bash script. ```$ ./install_libraries```
3. Put .env files in the rootDIR, another .env in the graphql directory. 
	* Link here :point_right: [googleDrive](https://drive.google.com/drive/folders/0B37hhRXKgRPOZG1MbUdwSEdVNWM)
	* **Be Careful** sometimes google drive or your operating system will change the ".env" filename into "_env" or "env". Make sure to change it back to ".env" 
	* make sure the **rootDIR** variable in the file matches your desired destination (home directory or any places). This rootDIR will be where it starts to hold analytics and downloadable data.
	e.g.```rootDIR=/home/chen/analytics-standalone```
	* make sure the **PYTHONPATH** variable points to where your python3 executable locates. e.g. ```PYTHONPATH = /usr/bin/python3```
4. **TEST** the analytics server by typing **_npm test_**; **_cd graphql_** and **_npm test_** to test graphql server;
5. **RUN** concurrently by typing **_npm start_**

## Port:
1. Analytic tools run on **http://localhost:8080/**
2. GraphQL data server runs on **http://localhost:5050/graphql/**

## WARNING:
1. For safety and developing reason, **.env** files are not included, if you don't have the permission to access [googleDrive](https://drive.google.com/drive/folders/0B37hhRXKgRPOZG1MbUdwSEdVNWM), 
Please contact me to get a copy
2. Make sure to subtitute any **credentials** in .env if not provided!
3. For details please review the **Memo.docx** file. Link here :point_right: [Memo](https://github.com/IllinoisSocialMediaMacroscope/analytics-standalone/tree/master/docs/memo.pdf)

:e-mail: email me: _***REMOVED***_

