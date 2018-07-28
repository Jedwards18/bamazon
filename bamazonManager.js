var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost2",
  port: 0,
  user: "root",
  password: "root",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayProducts();
});

function displayProducts() {
    console.log("\n--------------------\n");
    console.log("Products For Sale");
    console.log("\n--------------------\n");
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw (err);
        console.table(res);
        displayPrompt();
    })
};

function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw (err);
        console.table(res);
        lowInventoryDisplay();
    })
};

function updateInventory() {
    inquirer.prompt([
        {
            name: "item",
            type: "input",
            message: "For which item would you like to update the stock quantity (enter Item ID)?"
        }, {
            name: "quantity",
            type: "input",
            message: "What is the new stock quantity?",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
            }
        }
    ]).then(function(answer) {
        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: answer.quantity,
                }, {
                    item_id: answer.item,
                }
            ],
            function(err, res) {
                console.log(res.affectedRows + " inventory updated\n");
            }
        )
        displayProducts();
    })
};

function addNewProduct() {
    inquirer.prompt([
        {
            name: "item",
            type: "input",
            message: "What is the Item ID of the new product?"
        }, {
            name: "name",
            type: "input",
            message: "What is the name of the new product?",
        }, {
            name: "department",
            type: "input",
            message: "What is the department for the new products?",
        }, {
            name: "price",
            type: "input",
            message: "What is the price per unit of the new product?",
        }, {
            name: "quantity",
            type: "input",
            message: "How much of the new product do we have in stock?",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
            }
        }
    ]). then(function(answer) {
        connection.query(
        "INSERT INTO products SET ?",
        {
            item_id : answer.item,
            product_name : answer.name,
            department_name : answer.department,
            price : answer.price,
            stock_quantity : answer.quantity,
        },
        function(err, res) {
            console.log(res.affectedRows + " product added\n");
            displayProducts();
        }
      );
    })
};

function lowInventoryDisplay() {
    inquirer.prompt([
        {
            name: "followUpQuestion",
            message: "Would you like to add to this items inventory?",
        }
    ]).then(function(answer) {
        if (answer.followUpQuestion == "yes") {
            updateInventory();
        } else {
            console.log("Goodbye!");
        }
    })
};

function displayPrompt() {
    inquirer.prompt([
        {
            name: "actionsAvailable",
            type: "rawlist",
            choices: ["View Low Inventory", "Update Inventory", "Add New Product"],
        }
    ]).then(function(choice) {
        if (choice.actionsAvailable == "View Low Inventory") {
            viewLowInventory();
        } if (choice.actionsAvailable == "Update Inventory") {
            updateInventory();
        } if (choice.actionsAvailable == "Add New Product") {
            addNewProduct();
        }
    });
};