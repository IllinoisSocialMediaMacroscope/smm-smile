SocialMonitorGraphQL
SocialMonitor project based on GraphQL

Running instruction:
1. Make sure to install all the dependency in the top-level folder, as well as the "client" folder. Useful command “npm install && cd client && npm install && cd .. && cd front-end && npm install && cd .."
2. "client" using a developing port 3000, and proxy 8080 to connect with graphql server at 8080. Take a look at the "bin/www", "./client/index.js" and "./client/package.json" to change ports 
3. after all is done, just "npm start", both the server and the client should both be boosted up. You can access the hacked graphiql interface at localhost:3=5000, as well as the native graphiql comes with express-graphql at localhost:8080/graphql


Code Structure:
1. Entering point is “package.json”, which states all the dependency library and how to boost up this server; Pay attention to the "scripts": {...} in the “package.json”

2. “bin/www.” and  “app.js” handles routing. Especially “app.js” does all the heavy lifting. This is a NodeJS + express server. Notice in the app.js, there is this part:
		
		app.use('/graphql', cors(), graphqlHTTP({
		  schema,
		  graphiql: true
		}));
	
This is how we use graphql-express as a middleware to resolve data.

3. “data/schema” decide what the schema of each social media data source should be look like. 

4. all the "xxxSchema.js" file call functions in the API folder in order to request data from the restful endpoint from the social media servers. That's how actually data are gathered. We used a bunch of libraries for each social media to make our life easier.

5. graphql comes with a developer testing port "localhost:8080/graphql", which display a React frontend called Graphiql. However, in order to add monitoring function, I customized this graphiql; and the new interface lies in a react server, with a port “localhost:3000”. Code are hosted in the “client” folder.

6. “front-end” folder holds a Vue based website that serve as the homepage of our project, it has some introduction of this project, a login animated interface, and it points to the graphiql interface. Lunan worked on that, so any questions you can email: lunanli3@illinois.edu

7. Dustyn has a repository that holds the authentication and authorization (authorize user to get their social media access tokens) part. dtubbs2@illinois.edu. Right now I uploaded my own developer credentials in the file called “.env” just for you guys to have a “peek” what these credentials look like. You can get these by register at each social media developer site. PLEASE DON’T RELEASE THIS INFORMATION. And for your own developing, you should keep this as .env file, then use config.js to read into the system.

Useful Sources:
Backend:
•	NodeJs download: https://nodejs.org/en/download/
•	Express framework https://expressjs.com/
o	Important chapter about routing: https://expressjs.com/en/guide/routing.html
o	Just googled a tutorial: https://scotch.io/tutorials/keeping-api-routing-clean-using-express-routers

•	Graphql http://graphql.org/
o	Read some articles about graphql on http://graphql.org/community/Videos: 
o	Some videos that I have watched: https://www.youtube.com/watch?v=UBGzsb2UkeY
o	https://www.youtube.com/watch?v=WQLzZf34FJ8
o	https://www.youtube.com/watch?v=KOudxKJXsjc

•	MongoDB https://www.mongodb.com/
o	https://medium.com/the-ideal-system/graphql-and-mongodb-a-quick-example-34643e637e49

Frontend:
•	Vue: https://vuejs.org/
•	React: https://facebook.github.io/react/
•	Pug/Jade: https://pugjs.org/api/getting-started.html

