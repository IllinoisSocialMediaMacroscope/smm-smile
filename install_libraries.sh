#!/bin/bash

echo "Install python 3.x dependency libraries"
echo "--------------------------------------------------"
sudo pip3 install numpy scipy matplotlib pandas 
# sudo pip3 install pyldavis
sudo pip3 install scikit-learn
sudo pip3 install plotly
sudo pip3 install python-dotenv
sudo pip3 install beautifulsoup4
sudo pip3 install nltk
# also install nltk corpus
python3 ./nltk_download.py
# sudo pip3 install git+https://github.com/erikavaris/tokenizer.git
sudo pip3 install twython
sudo pip3 install networkx

echo "Install nodejs dependency libraries"
echo "--------------------------------------------------"
sudo npm install -g concurrently 
sudo npm install 
cd ./graphql
sudo npm install


