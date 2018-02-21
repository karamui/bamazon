// ------------------------------------ APPLICATION

// initializes "inquirer" and "mysql" packages
var inquirer = require("inquirer");
var mysql = require("mysql");

// declares global variable to hold query results
var resultArray;

// declares global variables to hold purchases, total cost, and product sales
var purchases = [];
var amounts = [];
var total = 0;
var sales = 0;

// declares global variable to hold query string for updating database
var update;

// creates mysql server connection
var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password",
	database: "bamazon"
});

// connects to mysql server
connection.connect();
 
loadQuery();

// ------------------------------------ FUNCTIONS

// function to buy a product
function buyThis() {
	inquirer.prompt([
	{
		message: "What is the Item ID of the product you would like to buy? (enter a number)",
		name: "id"
	}, 
	{
		message: "How many units would you like to buy? (enter a number)",
		name: "purchase"
	}
	]).then(function(answer) {
		// converts user input to integers
		var id = parseInt(answer.id);
		var quantity = parseInt(answer.purchase);

		// purchase logic
		if (isNaN(answer.id) == true || id <= 0 || id > resultArray.length) {
			// displays error message if user enters invalid item id
			console.log("\x1b[31mERROR: That item does not exist! Please select a valid item. \n\x1b[37m");
		} else if (isNaN(answer.purchase) == true || quantity == 0) {
			// displays error message if user tries to purchase zero units
			console.log("\x1b[31mERROR: You must order more than one unit to complete a purchase. \n\x1b[37m");
		} else if (quantity > resultArray[id - 1].stock_quantity) {
			// displays error message if user tries to purchase more units than are available
			console.log("\x1b[31mERROR: Insufficient quantity of stock! We do not have " + quantity + " units of Item " + id + ". There are only " + resultArray[id - 1].stock_quantity + " units available for purchase. Please order fewer units or select a different item. \n\x1b[37m");
		} else {
			// for a successful order...
			// adds product name and quantity to purchases
			purchases.push(resultArray[id - 1].product_name);
			amounts.push(quantity);

			// calculates cost of current order and total order
			var orderCost = quantity * resultArray[id - 1].price;
			orderCost = parseFloat(orderCost.toFixed(2));
			total += orderCost;
			total = parseFloat(total.toFixed(2));

			sales = resultArray[id - 1].product_sales + orderCost;

			// displays product selection, quantity, price, and cost of current order 
			console.log("You have selected Item " + id + ", " + resultArray[id - 1].product_name + ".");
			console.log("This item costs $" + resultArray[id - 1].price + " per unit. You have ordered " + quantity + " units.");
			console.log("This purchase costs $" + orderCost + ".");

			// displays all products and quantities ordered as well as total cost
			console.log("\n\x1b[36mYOU HAVE ORDERED...\x1b[37m");
			for (var i = 0; i < purchases.length; i++) {
				console.log(amounts[i] + " | " + purchases[i]);
			}
			console.log("\x1b[36mYour total cost is $" + total + ". \n\x1b[37m");

			// query to update the database
			update = "UPDATE products SET stock_quantity = " + (resultArray[id - 1].stock_quantity - quantity) + ", product_sales = " + sales + " WHERE item_id = " + id;

			// updates the database
			connection.query(update, function (error, results, fields) {
				if (error) {
					console.log(error);
				};
			});
		}

		// asks if the user would like to purchase more items
		keepGoing();
	});
}

// function to continue
function keepGoing() {
	// asks if the user would like to puchase more items
	inquirer.prompt([
	{
		message: "Would you like to purchase any more products?",
		type: "confirm",
		default: true,
		name: "keepgoing"
	}
	]).then(function(answer) {
		if(answer.keepgoing == true) {
			console.log("\n");
			loadQuery();
		} else {
			console.log("\x1b[36mThank you for your purchase! Goodbye.\x1b[37m");
			
			// closes mysql server connection 
			connection.end();
		}
	});
}

// function to load query
function loadQuery() {
	// displays all product information 
	connection.query("SELECT * FROM products", function (error, results, fields) {
		if (error) {
			console.log(error);
		};

		// updates resultArray with query results
		resultArray = results;
		
		console.log("\n\x1b[36mBAMAZON CURRENTLY OFFERS THE FOLLOWING ITEMS...")
		console.log("Item ID | Product Name | Department | Price | Stock Quantity \n\x1b[37m");

		for (var i = 0; i < results.length; i++) {
			console.log(results[i].item_id + " | " + results[i].product_name + " | " + results[i].department_name + " | $" + results[i].price + " | " + results[i].stock_quantity);
		}

		console.log("\n------------------------------------ \n");

		buyThis();
	});
}