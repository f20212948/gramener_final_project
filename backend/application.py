from flask import Flask
from flask_restful import Api
from flask_cors import CORS 
from resources.controller import (
    LoginResource, RegisterResource, LogoutResource, 
    UserDetailResource, 
    UtilityListResource, UtilityDetailResource,
    BillListResource, BillDetailResource,
    PaymentListResource, PaymentDetailResource,
    ReminderListResource, ReminderDetailResource,
    AdminUserListResource, AdminUtilityListResource, AdminBillListResource, AdminPaymentListResource,
    BatchPaymentResource # <-- NEW IMPORT
)
from resources import database as db 

app = Flask(__name__)
CORS(app, 
    resources={r"/api/*": {
        "origins": "http://localhost:3000", # Replace with your actual frontend URL if different
        # CRITICAL CORS FIX: Allow the 'Authorization' header
        "allow_headers": ["Content-Type", "X-USERNAME", "X-PASSWORD", "Authorization"], 
        "supports_credentials": True
    }}
)
api = Api(app)

# ----------------------------------------------------------------------
# Define all Endpoints
# ----------------------------------------------------------------------

# 🔑 Authentication Endpoints
api.add_resource(LoginResource, '/api/auth/login')
api.add_resource(RegisterResource, '/api/auth/register')
api.add_resource(LogoutResource, '/api/auth/logout') 

# 👤 User Management Endpoints
api.add_resource(UserDetailResource, '/api/users/<int:userId>') # GET, PUT

# 💡 Utility Management Endpoints
api.add_resource(UtilityListResource, '/api/utilities')
api.add_resource(UtilityDetailResource, '/api/utilities/<int:utilityId>')

# 💰 Bill Management Endpoints
api.add_resource(BillListResource, '/api/bills/<int:current_user_id>')
api.add_resource(BillDetailResource, '/api/bills/<int:billId>')

# 💳 Payment Management Endpoints
# 1. NEW BATCH PAYMENT ENDPOINT (POST)
api.add_resource(BatchPaymentResource, '/api/payments/batch/<int:current_user_id>') 
# 2. STANDARD PAYMENT LIST/GET ENDPOINT (GET) - MUST ONLY BE REGISTERED ONCE
api.add_resource(PaymentListResource, '/api/payments/<int:current_user_id>')
# 3. STANDARD PAYMENT DETAIL ENDPOINT
api.add_resource(PaymentDetailResource, '/api/payments/<int:paymentId>')

# 🔔 Reminders & Notifications
api.add_resource(ReminderListResource, '/api/reminders/<int:current_user_id>')
api.add_resource(ReminderDetailResource, '/api/reminders/<int:reminderId>')

# ⚙️ Admin-Specific Endpoints
api.add_resource(AdminUserListResource, '/api/admin/users')
api.add_resource(AdminUtilityListResource, '/api/admin/utilities')
api.add_resource(AdminBillListResource, '/api/admin/bills')
api.add_resource(AdminPaymentListResource, '/api/admin/payments')

# ----------------------------------------------------------------------
# Run
# ----------------------------------------------------------------------

if __name__ == '__main__':
    # Initialize the database and insert dummy data on startup
    db.create_table()
    db.insert_dummy_data()
    app.run(debug=True)