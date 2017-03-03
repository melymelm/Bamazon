var mysql = require("mysql");
var inquirer = require("inquirer");
var consTable = require("console.table");
var Table = require('cli-table');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "Bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
});

//Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.

var start = function() {

	connection.query("SELECT * FROM products", function(err,res) {
	console.log("------------------------------------------------------------------\nWHAT WE HAVE TODAY: ");

		var table = new Table({
                head: ["ItemID", "Product Name", "Department\nName", "Price", "Stock\nQuantity"],
                colWidths: [10, 30, 15, 10, 10]
            });
		for (var i = 0; i <res.length; i++) {
			var prodArray = [
				res[i].item_id,
				res[i].product_name,
				res[i].department_name,
				res[i].price,
				res[i].stock_quantity
				];
			table.push(prodArray);
		}
		console.log(table.toString());
		buyItem();
	});
}

// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.

var buyItem = function() {

		inquirer.prompt([{
			name: "prodID",
			type: "input",
			message: "What is the ID of the product you would like to purchase?"
		},{
			name: "units",
			type: "input",
			message: "How many units would you like to buy?"
		}
	]).then(function(answer) {
		// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
		var unitInt = parseInt(answer.units);

			connection.query("SELECT * FROM products WHERE ?", [{ item_id: answer.prodID }], function(err, data) {

				if (err) throw err;

				// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.

				if (data[0].stock_quantity < unitInt) {
				console.log("There isn't enough stock. Please choose another product.");
				start();
				} else {

					// However, if your store does have enough of the product, you should fulfill the customer's order.
					// This means updating the SQL database to reflect the remaining quantity.
					// Once the update goes through, show the customer the total cost of their purchase.
					var updateUnit = data[0].stock_quantity - unitInt;
					var totalPrice = data[0].price * unitInt;

					connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: updateUnit }, { item_id: answer.prodID }], function(err, res) {

						

						if (err) throw err;
						
					console.log("Your purchase was successful.\nYour total cost is: $ " + totalPrice);

					inquirer.prompt({
						name: "purchAgain",
						type: "confirm",
						message: "Would you like to buy anything else?"
					}).then(function(answer) {
						if (answer.purchAgain === true) {
							start();
						} else {
							console.log("Thank you for shopping with us.");
							connection.end();
						}
					});
				});

			};
	
		});
	});
};

start();







