CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
	item_id INTEGER(150) AUTO_INCREMENT NOT NULL,
	product_name VARCHAR(150) NOT NULL,
	department_name VARCHAR(150) NOT NULL,
	price DECIMAL(2,2),
	stock_quantity INTEGER(200),
	PRIMARY KEY (item_id)
);