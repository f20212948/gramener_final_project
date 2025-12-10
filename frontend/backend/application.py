from flask import Flask
from flask_restful import Api
from flask_cors import CORS 
# We still import database, but we don't call the setup functions directly here.
# import database as db 
from resources.controller import (
    LoginResource, RegisterResource, LogoutResource, 
    UserDetailResource, 
    UtilityListResource, UtilityDetailResource,
    BillListResource, BillDetailResource,
    PaymentListResource, PaymentDetailResource,
    ReminderListResource, ReminderDetailResource,
    AdminUserListResource, AdminUtilityListResource, AdminBillListResource, AdminPaymentListResource
)
from resources import database as db 

app = Flask(__name__)
CORS(app, 
    resources={r"/api/*": {
        "origins": "http://localhost:3000", # Replace with your actual frontend URL if different
        "allow_headers": ["Content-Type", "X-USERNAME", "X-PASSWORD"], # <-- THIS IS THE FIX
        "supports_credentials": True # Generally good practice when using custom headers for auth
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
api.add_resource(PaymentListResource, '/api/payments/<int:current_user_id>')
api.add_resource(PaymentDetailResource, '/api/payments/<int:paymentId>')

# 🔔 Reminders & Notifications
api.add_resource(ReminderListResource, '/api/reminders/<int:current_user_id>')
api.add_resource(ReminderDetailResource, '/api/reminders/<int:reminderId>')
# api.add_resource(ReminderDetailResource, '/api/reminders/<int:user_id>')


# ⚙️ Admin-Specific Endpoints
api.add_resource(AdminUserListResource, '/api/admin/users') # GET /api/admin/users is here
api.add_resource(AdminUtilityListResource, '/api/admin/utilities')
api.add_resource(AdminBillListResource, '/api/admin/bills')
api.add_resource(AdminPaymentListResource, '/api/admin/payments')

# ----------------------------------------------------------------------
# Run
# ----------------------------------------------------------------------

if __name__ == '__main__':
    # REMINDER: Run 'python database.py' once before running this file
    # to create and populate the database, or the app will fail!
    db.create_table()
    db.insert_dummy_data()
    app.run(debug=True)