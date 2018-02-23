// ------------------------------------ APPLICATION

// initializes "inquirer" and "mysql" packages
var inquirer = require("inquirer");
var mysql = require("mysql");

// declares global variables to hold query results
var productArray;
var departmentArray;

// declares global variables to hold product sales and profit
var productSales = [];
var profits = [];

// declares global variable to help deal with product sales and profit calculations
var departmentNames = ["Department Names"];

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

// function to add a new department to the database
function addDepartment() {
	// adds a new product to the database based on user input
	inquirer.prompt([
	{
		message: "What is the name of your new department?",
		name: "department_name"
	},
	{
		message: "What is the overhead cost of this department? (enter a number)",
		name: "overhead_costs"
	}
	]).then(function(answer) {
		// converts user input to floats
		var cost = parseFloat(answer.overhead_costs)
		cost = cost.toFixed(2);

		// checks if user input is valid
		if (isNaN(answer.overhead_costs) == true || cost <= 0) {
			console.log("\x1b[31mERROR: Please enter a overhead cost. \n\x1b[37m");
		} else {
			// query to update the database
			update = "INSERT INTO departments (department_name, overhead_costs) VALUES ('" + answer.department_name + "', " + cost +")";

			// updates the database
			connection.query(update, function (error, results, fields) {
				if (error) {
					console.log(error);
				};
			});

			// notifies the user that the new product has been added and displays new product information
			console.log("\n\x1b[36mNEW DEPARTMENT ADDED!");
			console.log("Department | Overhead Cost\x1b[37m");
			console.log(answer.department_name + " | $" + cost);
		}

		console.log("\n");
		keepGoing();
	});
}

// function to calculate display product sales and profit of each department
function calculateSales() {
	// initialize productSales array
	for (var i = 0; i < departmentNames.length - 1; i++) {
		productSales[i] = 0;
	}

	// calculate product sales by department
	for (var i = 0; i < productArray.length; i++) {
		for (var j = 0; j < departmentNames.length; j++) {
			// determine which department the product belongs to and add its sales to the department's total product sales
			if (departmentNames[j] == productArray[i].department_name) {
				productSales[j - 1] += productArray[i].product_sales;
			}
		}
	}

	// shows product sales and profits of each department
	console.log("\n\x1b[36mBAMAZON PRODUCT SALES BY DEPARTMENT")
	console.log("Department ID | Department | Overhead Costs | Product Sales | Total Profit \n\x1b[37m");

	for (var i = 0; i < departmentArray.length; i++) {
		profits[i] = productSales[i] - departmentArray[i].overhead_costs;

		if (profits[i] < 0) {
			console.log(departmentArray[i].department_id + " | " + departmentArray[i].department_name + " | $" + departmentArray[i].overhead_costs + " | $" + productSales[i].toFixed(2) + " | \x1b[31m-$" + Math.abs(profits[i]).toFixed(2) + "\x1b[37m");
		} else {
			console.log(departmentArray[i].department_id + " | " + departmentArray[i].department_name + " | $" + departmentArray[i].overhead_costs + " | $" + productSales[i].toFixed(2) + " | \x1b[32m$" + profits[i].toFixed(2) + "\x1b[37m");
		}
	}
	console.log("\n------------------------------------ \n");
	keepGoing();
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
	// acquires all department information 
	connection.query("SELECT * FROM departments", function (error, results, fields) {
		if (error) {
			console.log(error);
		};

		// updates departmentArray with query results
		departmentArray = results;

		// flag for determining uniqueness
		var flag = false;

		for (var i = 0; i < departmentArray.length; i++) {
			for (var j = 0; j < departmentNames.length; j++) {
				if (departmentNames[j] == departmentArray[i].department_name) {
					flag = true;
					break;
				}
			}

			// add unique department names to departmentNames array
			if (flag == false) {
			departmentNames.push(departmentArray[i].department_name);
			} else {
				flag = false;
			}
		}

		// acquires all product information 
		connection.query("SELECT * FROM products", function (error, results, fields) {
			if (error) {
				console.log(error);
			};

			// updates productArray with query results
			productArray = results;

			// asks what user would like to do
			inquirer.prompt([
			{
				message: "What would you like to do?",
				type: "list",
				choices: ["View product sales by department.", "Create new department."],
				name: "dothis"
			}
			]).then(function(answer) {
				if (answer.dothis == "View product sales by department.") {
					calculateSales();
				} else if (answer.dothis == "Create new department.") {
					// allows user to add a new department to the database
					addDepartment();
				} else {
					console.log("\x1b[31mERROR!\x1b[37m");
				}
			});
		});
	});	
}