
const express = require('express'); 
const router = express.Router(); 

const stripe = require('stripe')(process.env.STRIPE_SECRET); 



router.post("/checkout", async (req, res) => {
    console.log(process.env.STRIPE_SECRET)
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
        success_url: "https://peak-threads.netlify.app/success",
        cancel_url: "https://peak-threads.netlify.app/cancel"
    });

    res.send(JSON.stringify({
        url: session.url
    }));
});



module.exports = router;
