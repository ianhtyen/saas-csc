# CSC Cloud Computing Assignment 2

Using node.js

## Installation

Use the npm package manager (Make sure you are on the root folder)

```bash
npm init
```
then
```bash
npm install
```

## Configuration

Create `.env` for environment variables. Add these:
```
aws-secretKey=x
aws-accessKey=x
portfordevelopment=2021
```

Create `config.js` for configuration data. Add these:
```JSON
exports.awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": "x", 
    "secretAccessKey": "x",
    "sessionToken": "x"
};
```

## Usage

```bash
npm start or node app.js
```
