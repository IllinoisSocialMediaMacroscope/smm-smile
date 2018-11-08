#!/bin/bash

echo "Install python 3.x dependency libraries"
echo "--------------------------------------------------"
pip3 install --user numpy scipy matplotlib pandas 
# sudo pip3 install pyldavis
pip3 install --user scikit-learn
pip3 install --user plotly
pip3 install --user python-dotenv
pip3 install --user beautifulsoup4
pip3 install --user nltk
# also install nltk corpus
python3 ./nltk_download.py
# sudo pip3 install git+https://github.com/erikavaris/tokenizer.git
pip3 install --user twython
pip3 install --user networkx

echo "Install nodejs dependency libraries"
echo "--------------------------------------------------"
npm install concurrently 
npm install 
cd ./graphql
npm install


