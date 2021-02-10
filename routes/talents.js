const express = require('express');
const router = express.Router();
var mysql = require('mysql');


//mysql
function createDbConnection(){
    var connection = mysql.createConnection({
        //host: "csc-ca2-db-instance.c1hallmmvxny.us-east-1.rds.amazonaws.com",
        //user: "csc_ca2_user",
        host: "csc-database.cidejfucv1xv.us-east-1.rds.amazonaws.com",
        user: "csc_ca2_user",
        password: "csc-Ca2!",
        port: 3306
    });
    return connection;
}

//Create table and db or reset db
router.get('/reset',(req,res)=>{
    var connection = createDbConnection();
    connection.connect();

    connection.query('DROP DATABASE IF EXIST csc_ca2;');

    connection.query('CREATE DATABASE IF NOT EXISTS csc_ca2;',
    function (error, result, fields) {
        if (error) { console.log(error); }
        if (result) { console.log("database created"); }
    });

    connection.query(`USE csc_ca2;`);

    connection.query('CREATE TABLE IF NOT EXISTS csc_ca2_db(id int NOT NULL AUTO_INCREMENT, name varchar(255), bio varchar(255), imageLongUrl varchar(255), PRIMARY KEY(id));',
    function (error, result) {
        if (error) {
            //error;
            console.log(error);
        }
        if (result) {
            result;
            console.log("created");
            console.log(result);
        }
    });

    connection.end();

    return res.status(200).send("Reset Database successfully");
});

//Store talents
router.post('/data',(req, res)=>{
    var itemBody = req.body;
    console.log(itemBody);
    var connection = createDbConnection();
    connection.connect();

    connection.query(`USE csc_ca2`);

    connection.query(`INSERT INTO csc_ca2_db(name, bio, imageLongUrl) VALUES ('${itemBody.name}', '${itemBody.bio}', '${itemBody.imageLongUrl}')`,
    function (err, result) {
        if (err) {
            //error;
            connection.end();
            console.log(err);
            return res.status(200).send(err);
        }
        if (result) {
            connection.end();
            return res.status(200).send("Successfully Uploaded");
        }
    });
});

//Get talents
router.get('/data',(req, res)=>{
    var connection = createDbConnection();
    connection.connect();

    connection.query(`USE csc_ca2`);

    connection.query('SELECT * FROM csc_ca2_db;',
    function (error, result) {
        if (error) {
            //error;
            console.log(error);
            return res.status(400).send(error);
        }
        if (result) {
            connection.end();
            return res.status(200).send(result);
        }
    });
});

//Delete Talents
router.delete('/data/:talentId',(req,res)=>{
    var itemBody = req.params;
    console.log(itemBody);
    var connection = createDbConnection();
    connection.connect();

    connection.query(`USE csc_ca2`);

    connection.query(`DELETE FROM csc_ca2_db WHERE id=${itemBody.talentId};`,
    function (err, result) {
        if (err) {
            //error;
            connection.end();
            console.log(err);
            return res.status(404).send(err);
        }
        if (result) {
            connection.end();
            console.log(result);
            if(result.affectedRows != 0) {
                return res.status(200).send(result);
            } else {
                return res.status(404).send("Not Found")
            }
        }
    });
});

//Update Talents
router.put('/data/:talentId',(req,res)=>{
    var itemParam = req.params;
    var itemBody = req.body;
    console.log(itemBody);
    var connection = createDbConnection();
    connection.connect();

    connection.query(`USE csc_ca2`);

    connection.query(`UPDATE csc_ca2_db SET name="${itemBody.name}", bio="${itemBody.bio}" WHERE id=${itemParam.talentId};`,
    function (err, result) {
        if (err) {
            //error;
            connection.end();
            console.log(err);
            return res.status(404).send(err);
        }
        if (result) {
            connection.end();
            console.log(result);
            if(result.affectedRows != 0) {
                return res.status(200).send(result);
            } else {
                return res.status(404).send("Not Found")
            }
        }
    });
});

module.exports = router; 
