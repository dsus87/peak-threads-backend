
const express = require('express'); 
const router = express.Router(); 

var cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET); 

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());



router.post("/checkout", async (req, res) => {
    
    console.log(req.body);
    const items = req.body.items;
    let lineItems = [];
    items.forEach((item)=> {
        lineItems.push(
            {
                price: item.stripeId,
                quantity: item.quantity
            }
        )
    });

    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cancel"
    });

    res.send(JSON.stringify({
        url: session.url
    }));
});

app.listen(4000, () => console.log("Listening on port 4000!"));


module.exports = router;
