// MongoDB initialization script
db = db.getSiblingDB('farm_to_table');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('payments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.products.createIndex({ "farmer_id": 1 });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "name": "text", "description": "text" });

db.orders.createIndex({ "customer_id": 1 });
db.orders.createIndex({ "farmer_id": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "created_at": -1 });

db.payments.createIndex({ "order_id": 1 });
db.payments.createIndex({ "stripe_payment_intent_id": 1 });

print('Database initialized successfully');