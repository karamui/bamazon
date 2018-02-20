-- create bamazon database
DROP DATABASE IF EXISTS bamazon; -- drop database if it exists (ONLY FOR USE IN HW)
CREATE DATABASE bamazon;

-- select bamazon database
USE bamazon;

-- create products table
CREATE TABLE products (
item_id INTEGER(10) AUTO_INCREMENT NOT NULL,
product_name VARCHAR(250) NOT NULL,
department_name VARCHAR(100) NOT NULL,
price FLOAT(10, 2) NOT NULL,
stock_quantity INTEGER(10) NOT NULL,
PRIMARY KEY (item_id)
);

-- add ten products to products table
INSERT INTO 
	products (product_name, department_name, price, stock_quantity)
VALUES 
	("HP Omen 17.3' Gaming Laptop", "Electronics", 849.99, 100),
	("Amazon Key In-Home Kit", "Electronics", 249.99, 100),
	("Tablet Stand Multi-Angle", "Electronics", 10.96, 100),
	("Taotronics Bluetooth 4.1 Transmitter / Receiver", "Electronics", 28.49, 100),
	("Wireless Bluetooth Speaker", "Electronics", 18.98, 100),
	("1080P WiFi Mini Camera", "Electronics", 33.99, 100),
	("Portable Chargers 16750 RAVPower", "Electronics", 25.49, 100),
	("Laptop Backpack with USB Port and Multiple Zipper Pockets", "Electronics", 19.99, 100),
	("Laptop Sleeve Case  11.6 - 12.3in", "Electronics", 10.26, 100),
	("Samsung Electronics UN65MU6300 65in 4K Ultra HD Smart LED TV", "Electronics", 879.00, 100);
   
-- displays all product information   
-- SELECT * FROM products;