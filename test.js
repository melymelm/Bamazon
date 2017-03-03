// Node npm var declarations
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
//creates a connection to MySQL database
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Password2016!',
    database: 'Bamazon'
});
//Provides status of SQL connection
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id' + connection.threadId + '\n\n');
    start();
});


// performs inital query of Products table from database
var start = function() {
    connection.query('SELECT * FROM Products', function(err, res) {
        console.log('---------------------------------');
        console.log('Available Bamazon Products');
        console.log('---------------------------------');
        // New Table instance to format returned sql data
            var table = new Table({
                head: ['ItemID', 'ProductName', 'Price', 'Quantity'],
                colWidths: [10, 40, 10, 10]
            });
        for (var i=0; i < res.length; i++) {
            var productArray = [res[i].ItemID, res[i].ProductName, res[i].Price, res[i].StockQuantity];
            table.push(productArray);
        }
        console.log(table.toString());
        buyItem();
        });
    };

//Prompts the customer on which item to buy
var buyItem = function() {
    inquirer.prompt([{
        name: "Item",
        type: "input",
        message: "Choose the ID of the Item you would like to buy",
        validate: function(value) {
            //validates answer
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log("\nPlease enter only the Item number of the item you'd like to buy\n");
                return false;
            }
        }
    }, {//Prompts the customer for the quantity
        name: "Qty",
        type: "input",
        message: "How many would you like to buy?",
        validate: function(value) {
            //validates answer
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log("\nPlease enter a valid Quantity\n");
                return false;
            }
        }
        }]).then(function(answer) {
            var ItemInt = parseInt(answer.Qty);
                //Queries the database
                connection.query("SELECT * FROM Products WHERE ?", [{ItemID: answer.Item}], function(err, data) { 
                    if (err) throw err;
                    //Checks if sufficient quantity exists
                    if (data[0].StockQuantity < ItemInt) {
                       console.log("We're sorry, that Item is currently out of stock\n");
                       console.log("Please choose another Product\n");
                       start(); 
                    } else {
                        //if quantity exists updates database
                        var updateQty = data[0].StockQuantity - ItemInt;
                        var totalPrice = data[0].Price * ItemInt;
                        connection.query('UPDATE products SET StockQuantity = ? WHERE ItemID = ?', [updateQty, answer.Item], function(err, results) {
                        if(err) {
                            throw err;
                        } else {
                        console.log("Purchase successfull!\n");
                        console.log("Your total cost is: $ " + totalPrice);
                        //Asks the buyer if they would like to continue
                        inquirer.prompt({
                            name: "buyMore",
                            type: "confirm",
                            message: "Would you like to buy another Product?",
                        }).then(function(answer) {
                            if (answer.buyMore === true) {
                                start();
                            } else {
                                console.log("Thank your for shopping with Bamazon!");
                                connection.end();
                            }
                        });
                        }
                    });
                }               
            });
        });
    };