const Product = require('../models/Product.model');

async function updateProductQuantities(products) {
    try {
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            // Check if the specified size is valid and in stock
            if (!product.quantity[item.size]) {
                throw new Error(`Size ${item.size} for product ID ${item.productId} is invalid or out of stock`);
            }
            product.quantity[item.size] -= item.quantity;
            if (product.quantity[item.size] < 0) {
                throw new Error(`Not enough stock for product ID ${item.productId}, size ${item.size}`);
            }
            await product.save();
        }
    } catch (error) {
        console.error('Failed to update product quantities:', error);
        throw error; 
    }
}

module.exports = {
    updateProductQuantities,
};
