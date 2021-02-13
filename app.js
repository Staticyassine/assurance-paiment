const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");
var path = require('path')

var link = "http://192.168.11.104:3000/"

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AS8MHA57mHdJ4hgv_ppdGntmBV_yw0Jqm4UDHoYXmXqbCw83W0Z1UL-JKXqkl2exPuBIsRff0sjHVYw0",
    client_secret:
        "EHRPT2xasXixYo3r7gileZMDzfbJiDOOdZp59qwl2qPxzFEiQPb2pYnHCLgY1aOjhYra6nzwi45Qgsaj"
});

app.get("/", (req, res) => {
    res.render("index");
    //res.send("works so fine");
});

app.get("/paypal", (req, res) => {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: link + "success",
            cancel_url: link +  "cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "item",
                            sku: "item",
                            price: "300.00",
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "300.00"
                },
                description: "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
           // res.send("ok");
           res.redirect(payment.links[1].href);
        }
    });
});

app.get("/success", (req, res) => {
   //  res.send("Success");
    
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;

    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "300.00"
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
    
});

app.get("cancel", (req, res) => {
    res.send("cancel");
    res.render("cancel");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000/2 ");
});