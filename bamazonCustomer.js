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
    console.log("Welcome to Bamazon! How Can We Help You Today?");
    console.log("\n--------------------\n");
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw (err);
        console.table(res);
        promptUser();
    })
};

function afterPurchaseDisplay() {
    inquirer.prompt([
        {
            name: "followUpQuestion",
            message: "Would you like to make another purchase?",
        }
    ]).then(function(answer) {
        if ("yes") {
            displayProducts();
        } else {
            console.log("Goodbye!");
            //console.reset();
        }
    })
};

// console.reset = function () {
//     return process.stdout.write('\033c');
// };

function promptUser() {
    connection.query("SELECT * FROM products", function(err,results) {
        if (err) throw (err);
        inquirer.prompt([
            {
                name: "productID",
                //type: "rawlist",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].item_id);
                    }
                    return choiceArray;
                },
                message: "What is the Item ID of the product you would like to buy?",
            }, {
                name: "numberUnits",
                type: "input",
                message: "How many units would you like to buy?",
            }
        ]).then(function(answer) {
            var chosenItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].item_id === answer.productID) {
                    chosenItem = results[i];
                }
            }

            if (chosenItem.stock_quantity >= parseInt(answer.numberUnits)) {
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: chosenItem.stock_quantity - answer.numberUnits
                        }, 
                        {
                            item_id: chosenItem.item_id,
                        }
                    ],
                    function(error) {
                        if (error) throw (error);

                        var total = answer.numberUnits * chosenItem.price;
                        console.log("\n--------------------\n");
                        console.log("You have ordered " + answer.numberUnits + " units of " + chosenItem.product_name);
                        console.log("\n--------------------\n");
                        console.log("Your total today is $" + total + ".");
                        console.log("\n--------------------\n");
                        console.log("Thank you for your purchase!")
                        //displayProducts();
                        afterPurchaseDisplay();
                        //promptUser()
                    } 
                );
            } else {
                console.log("Insufficient quantity!");
                //promptUser()
                afterPurchaseDisplay();
            }
        });
    });
};