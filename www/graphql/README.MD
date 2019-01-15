# GraphQL

A GraphQL interface to query various social media APIs.

## Docker

Do you build docker container run:

```docker build -t socialmediamacroscope/graphql .```

To run docker container run:

```docker run -p 49160:5050 -v /absolute/path/to/graphql_config.json:/usr/src/app/graphql_config.json:ro --name ssm-graphql socialmediamacroscope/graphql```

Open browser to:

```http://localhost:49160/graphql```