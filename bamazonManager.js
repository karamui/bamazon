// ------------------------------------ APPLICATION

// initializes "inquirer" and "mysql" packages
var inquirer = require("inquirer");
var mysql = require("mysql");

// declares global variable to hold query results
var resultArray;

// declares global variable to hold query string for updating database
var update;

// creates mysql server connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "bamazon"
});

// connects to mysql server
connection.connect();
 
loadQuery();

// ------------------------------------ FUNCTIONS

// function to add items to inventory
function addInventory() {
	// shows current inventory
	console.log("\n\x1b[36mBAMAZON CURRENTLY OFFERS THE FOLLOWING ITEMS...")
	console.log("Item ID | Product Name | Department | Price | Stock Quantity \n\x1b[37m");

	for (var i = 0; i < resultArray.length; i++) {
		console.log(resultArray[i].item_id + " | " + resultArray[i].product_name + " | " + resultArray[i].department_name + " | $" + resultArray[i].price + " | " + resultArray[i].stock_quantity);
	}

	console.log("\n------------------------------------ \n");

	// adds to inventory based on user input
	inquirer.prompt([
	{
		message: "For which item would you like to add inventory? (enter item id)",
		name: "id"
	},
	{
		message: "How many more units are you adding? (enter a number)",
		name: "quantity"
	}
	]).then(function(answer) {
		// converts user input to integers
		var id = parseInt(answer.id);
		var quantity = parseInt(answer.quantity);

		// checks if user input is valid
		if (isNaN(answer.id) == true || id <= 0 || id > resultArray.length) {
			console.log("\x1b[31mERROR: That item does not exist! Please select a valid item. \n\x1b[37m");
		} else if (isNaN(answer.quantity) == true || quantity <= 0) {
			console.log("\x1b[31mERROR: You must add more than one unit. \n\x1b[37m");
		} else {
			// query to update the database
			update = "UPDATE products SET stock_quantity = " + (resultArray[id - 1].stock_quantity + quantity) + " WHERE item_id = " + id;

			// updates the database
			connection.query(update, function (error, results, fields) {
				if (error) {
					console.log(error);
				};
			});

			// notifies the user that the desired inventory has been added and displays updated product information
			console.log("\n\x1b[36mINVENTORY ADDED!");
			console.log("Quantity Added | Item ID | Product Name | Department | Price | Stock Quantity\x1b[37m");
			console.log(quantity + " | " + resultArray[id - 1].item_id + " | " + resultArray[id - 1].product_name + " | " + resultArray[id - 1].department_name + " | $" + resultArray[id - 1].price + " | " + (resultArray[id - 1].stock_quantity + quantity));
		}

		console.log("\n");
		keepGoing();
	});
}

// function to add a new product to inventory
function addProduct() {
	// adds a new product to the database based on user input
	inquirer.prompt([
	{
		message: "What is the name of your new product?",
		name: "product_name"
	},
	{
		message: "What department is this product from?",
		name: "department_name"
	},
	{
		message: "How much does this product cost per unit? (enter a number)",
		name: "price"
	},
	{
		message: "How many units of this product do you have? (enter a number)",
		name: "stock_quantity"
	}
	]).then(function(answer) {
		// converts user input to integers
		var price = parseFloat(answer.price)
		price = price.toFixed(2);
		var stock_quantity = parseInt(answer.stock_quantity);

		// checks if user input is valid
		if (isNaN(answer.price) == true || price <= 0) {
			console.log("\x1b[31mERROR: Please enter a valid price. \n\x1b[37m");
		} else if (isNaN(answer.stock_quantity) || stock_quantity <= 0) {
			console.log("\x1b[31mERROR: Please enter a valid stock quantity. \n\x1b[37m");
		} else {
			// query to update the database
			update = "INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales) VALUES ('" + answer.product_name + "', '" + answer.department_name + "', " + price + ", " + stock_quantity + ", 0)";

			// updates the database
			connection.query(update, function (error, results, fields) {
				if (error) {
					console.log(error);
				};
			});

			// notifies the user that the new product has been added and displays new product information
			console.log("\n\x1b[36mNEW PRODUCT ADDED!");
			console.log("Product Name | Department | Price | Stock Quantity\x1b[37m");
			console.log(answer.product_name + " | " + answer.department_name + " | $" + price + " | " + stock_quantity);
		}

		console.log("\n");
		keepGoing();
	});
}

// function to continue
function keepGoing() {
	// asks if the user would like to return to the main menu
	inquirer.prompt([
	{
		message: "Would you like to return to the main menu?",
		type: "confirm",
		default: true,
		name: "keepgoing"
	}
	]).then(function(answer) {
		if(answer.keepgoing == true) {
			console.log("\n");
			loadQuery();
		} else {
			console.log("\x1b[36mGoodbye.\x1b[37m");
			
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

		// asks what user would like to do
		inquirer.prompt([
		{
			message: "What would you like to do?",
			type: "list",
			choices: ["View products for sale.", "View low inventory.", "Add to inventory.", "Add new product."],
			name: "dothis"
		}
		]).then(function(answer) {
			if (answer.dothis == "View products for sale.") {
				// shows current inventory
				console.log("\n\x1b[36mBAMAZON CURRENTLY OFFERS THE FOLLOWING ITEMS...")
				console.log("Item ID | Product Name | Department | Price | Stock Quantity \n\x1b[37m");

				for (var i = 0; i < results.length; i++) {
					console.log(results[i].item_id + " | " + results[i].product_name + " | " + results[i].department_name + " | $" + results[i].price + " | " + results[i].stock_quantity);
				}
				console.log("\n------------------------------------ \n");
				keepGoing();
			} else if (answer.dothis == "View low inventory.") {
				// shows items which have fewer than 10 units remaining
				console.log("\n\x1b[36mBAMAZON IS RUNNING LOW ON THE FOLLOWING ITEMS...")
				console.log("Item ID | Product Name | Department | Price | Stock Quantity \n\x1b[37m");

				for (var i = 0; i < results.length; i++) {
					if (results[i].stock_quantity <= 10) {
						console.log(results[i].item_id + " | " + results[i].product_name + " | " + results[i].department_name + " | $" + results[i].price + " | " + results[i].stock_quantity);
					}
				}
				console.log("\n------------------------------------ \n");
				keepGoing();
			} else if (answer.dothis == "Add to inventory.") {
				// allows user to add items to the inventory
				addInventory();
			} else if (answer.dothis == "Add new product.") {
				// allows user to add a new product to the database
				addProduct();
			} else {
				console.log("\x1b[31mERROR!\x1b[37m");
			}
		});
	});
}