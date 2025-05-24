import frappe
from frappe import _


@frappe.whitelist()
def get_laboratory_items():
    """
    Get all items with item_group = 'Laboratory'
    Returns a list of laboratory items with basic details
    """
    try:
        items = frappe.get_all(
            "Item",
            filters={
                "item_group": "Laboratory",
                "is_sales_item": 1,
                "disabled": 0
            },
            fields=[
                "name",
                "item_name", 
                "item_code",
                "standard_rate",
                "item_group",
                "description",
                "image"
            ],
            order_by="item_name"
        )
        
        return {
            "status": "success",
            "data": items,
            "count": len(items)
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching laboratory items: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }

@frappe.whitelist(allow_guest=True)
def get_laboratory_items_by_filter(filter_name=None):
    """
    Get items based on provided filters
    Returns a list of items with basic details
    """
    try:
        # Log the incoming filter
        frappe.logger().debug(f"Received filter: {filter_name}")
        
        # Parse filter if it's a string
        if isinstance(filter_name, str):
            import json
            try:
                filter_name = json.loads(filter_name)
            except:
                filter_name = {"disabled": 0, "is_sales_item": 1}

        # Ensure basic filters are present
        if not isinstance(filter_name, dict):
            filter_name = {"disabled": 0, "is_sales_item": 1}
        
        # Add default filters if not present
        if "disabled" not in filter_name:
            filter_name["disabled"] = 0
        if "is_sales_item" not in filter_name:
            filter_name["is_sales_item"] = 1

        # Log the processed filter
        frappe.logger().debug(f"Processed filter: {filter_name}")

        items = frappe.get_all(
            "Item",
            filters=filter_name,
            fields=[
                "name",
                "item_name",
                "item_code", 
                "standard_rate",
                "item_group",
                "description",
                "image",
                "brand",
                "stock_uom",
                "is_sales_item",
                "is_stock_item", 
                "has_batch_no",
                "has_serial_no",
                "disabled",
                "valuation_rate",
                "last_purchase_rate",
                "min_order_qty",
                "safety_stock",
                "lead_time_days", 
                "max_discount",
                "is_fixed_asset",
                "asset_category",
                "asset_naming_series",
                "gst_hsn_code",
                "weight_per_unit",
                "weight_uom"
            ],
            order_by="item_name"
        )

        # Log the number of items found
        frappe.logger().debug(f"Found {len(items)} items")

        # Get price list rates and pricing details for each item
        for item in items:
            # Get price list rates
            price_list_rates = frappe.get_all(
                "Item Price",
                filters={
                    "item_code": item.item_code,
                    "selling": 1
                },
                fields=[
                    "name",
                    "price_list",
                    "price_list_rate",
                    "currency",
                    "valid_from",
                    "valid_upto",
                    "note",
                    "reference",
                    "batch_no",
                    "uom",
                    "packing_unit"
                ]
            )

            # Get pricing rules for discounts
            pricing_rules = frappe.get_all(
                "Pricing Rule",
                filters={
                    "item_code": item.item_code,
                    "selling": 1
                },
                fields=[
                    "name",
                    "discount_percentage",
                    "discount_amount",
                    "valid_from",
                    "valid_upto",
                    "priority",
                    "apply_on",
                    "rate_or_discount",
                    "condition"
                ]
            )

            # Calculate discounted price for each price list
            for price in price_list_rates:
                price["pricing_rules"] = pricing_rules
                if pricing_rules:
                    # Apply the highest priority discount
                    highest_priority_rule = max(pricing_rules, key=lambda x: x.get("priority", 0))
                    if highest_priority_rule.get("discount_percentage"):
                        price["discounted_rate"] = price["price_list_rate"] * (1 - highest_priority_rule["discount_percentage"] / 100)
                    elif highest_priority_rule.get("discount_amount"):
                        price["discounted_rate"] = price["price_list_rate"] - highest_priority_rule["discount_amount"]
                    else:
                        price["discounted_rate"] = price["price_list_rate"]
                else:
                    price["discounted_rate"] = price["price_list_rate"]

            item["price_details"] = price_list_rates

        # Log the final response
        frappe.logger().debug(f"Returning {len(items)} items with price details")

        return {
            "status": "success", 
            "data": items,
            "count": len(items)
        }
    except Exception as e:
        frappe.log_error(f"Error fetching laboratory items: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }

@frappe.whitelist()
def search_laboratory_items(search_term=""):
    """
    Search laboratory items by name or item code
    """
    try:
        filters = {
            "item_group": "Laboratory",
            "is_sales_item": 1,
            "disabled": 0
        }
        
        # Add search condition if search term is provided
        if search_term:
            filters.update({
                "item_name": ["like", f"%{search_term}%"]
            })
        
        items = frappe.get_all(
            "Item",
            filters=filters,
            fields=[
                "name",
                "item_name", 
                "item_code",
                "standard_rate",
                "item_group",
                "description",
                "image"
            ],
            order_by="item_name",
            limit=50
        )
        
        return {
            "status": "success",
            "data": items,
            "count": len(items),
            "search_term": search_term
        }
        
    except Exception as e:
        frappe.log_error(f"Error searching laboratory items: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@frappe.whitelist()
def search_customers_and_patients(search_term=""):
    """
    Search customers by name or phone and return associated patient information
    """
    try:
        # Get search_term from request arguments if not passed directly
        if not search_term:
            search_term = frappe.form_dict.get('search_term', '')
        
        if not search_term:
            return {
                "status": "error",
                "message": "Search term is required",
                "data": []
            }
        
        # Search customers by name or mobile number
        customers = frappe.get_all(
            "Customer",
            filters={
                "disabled": 0
            },
            or_filters=[
                {"customer_name": ["like", f"%{search_term}%"]},
                {"mobile_no": ["like", f"%{search_term}%"]},
                {"name": ["like", f"%{search_term}%"]}
            ],
            fields=[
                "name",
                "customer_name",
                "mobile_no",
                "email_id",
                "customer_group",
                "territory"
            ],
            limit=20
        )
        
        # For each customer, get associated patients
        result = []
        for customer in customers:
            # Get patients linked to this customer
            patients = frappe.get_all(
                "Patient",
                filters={"customer": customer.name},
                fields=[
                    "name",
                    "patient_name",
                    "sex",
                    "blood_group",
                    "dob",
                    "mobile",
                    "email",
                    "patient_details"
                ]
            )
            
            result.append({
                "customer": customer,
                "patients": patients
            })
        
        return {
            "status": "success",
            "data": result,
            "count": len(result),
            "search_term": search_term
        }
        
    except Exception as e:
        frappe.log_error(f"Error searching customers and patients: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@frappe.whitelist()
def get_patient_details(patient_id):
    """
    Get detailed information about a specific patient
    """
    try:
        if not patient_id:
            return {
                "status": "error",
                "message": "Patient ID is required",
                "data": None
            }
        
        # Get patient details
        patient = frappe.get_doc("Patient", patient_id)
        
        # Get customer details
        customer = None
        if patient.customer:
            customer = frappe.get_doc("Customer", patient.customer)
        
        return {
            "status": "success",
            "data": {
                "patient": {
                    "name": patient.name,
                    "patient_name": patient.patient_name,
                    "sex": patient.sex,
                    "blood_group": patient.blood_group,
                    "dob": patient.dob,
                    "mobile": patient.mobile,
                    "email": patient.email,
                    "patient_details": patient.patient_details,
                    "customer": patient.customer
                },
                "customer": {
                    "name": customer.name if customer else None,
                    "customer_name": customer.customer_name if customer else None,
                    "mobile_no": customer.mobile_no if customer else None,
                    "email_id": customer.email_id if customer else None
                } if customer else None
            }
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching patient details: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": None
        }


@frappe.whitelist()
def get_current_user():
    """
    Get current user details from Frappe session
    """
    try:
        # Get current user from session
        current_user = frappe.session.user
        
        if not current_user or current_user == "Guest":
            return {
                "status": "error",
                "message": "User not authenticated",
                "data": None
            }
        
        # Get user document
        user_doc = frappe.get_doc("User", current_user)
        
        # Get user profile information
        user_data = {
            "email": user_doc.email,
            "full_name": user_doc.full_name or user_doc.first_name or current_user,
            "first_name": user_doc.first_name,
            "last_name": user_doc.last_name,
            "username": user_doc.username or current_user,
            "user_image": user_doc.user_image,
            "mobile_no": user_doc.mobile_no,
            "phone": user_doc.phone,
            "role_profile_name": user_doc.role_profile_name,
            "user_type": user_doc.user_type,
            "language": user_doc.language,
            "time_zone": user_doc.time_zone,
            "desk_theme": user_doc.desk_theme,
            "enabled": user_doc.enabled
        }
        
        # Get user roles
        user_roles = frappe.get_all(
            "Has Role",
            filters={"parent": current_user},
            fields=["role"]
        )
        
        user_data["roles"] = [role.role for role in user_roles]
        
        return {
            "status": "success",
            "data": user_data
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching current user details: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": None
        }


@frappe.whitelist()
def get_lab_test_templates():
    """
    Get all lab test templates for diagnostic orders
    Returns a list of lab test templates with basic details
    """
    try:
        # Get lab test templates
        templates = frappe.get_all(
            "Lab Test Template",
            filters={
                "disabled": 0,
                "is_billable": 1
            },
            fields=[
                "name",
                "lab_test_name",
                "lab_test_code", 
                "lab_test_rate",
                "lab_test_group",
                "department",
                "lab_test_template_type",
                "lab_test_description",
                "sample",
                "sample_qty",
                "lab_test_uom"
            ],
            order_by="lab_test_name"
        )
        
        return {
            "status": "success",
            "data": templates,
            "count": len(templates)
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching lab test templates: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@frappe.whitelist()
def search_lab_test_templates(search_term="", department=""):
    """
    Search lab test templates by name, code, or department
    """
    try:
        filters = {
            "disabled": 0,
            "is_billable": 1
        }
        
        # Add department filter if provided
        if department and department != "all":
            filters["department"] = department
        
        # Add search condition if search term is provided
        or_filters = []
        if search_term:
            or_filters = [
                {"lab_test_name": ["like", f"%{search_term}%"]},
                {"lab_test_code": ["like", f"%{search_term}%"]},
                {"lab_test_description": ["like", f"%{search_term}%"]}
            ]
        
        query_args = {
            "doctype": "Lab Test Template",
            "filters": filters,
            "fields": [
                "name",
                "lab_test_name",
                "lab_test_code", 
                "lab_test_rate",
                "lab_test_group",
                "department",
                "lab_test_template_type",
                "lab_test_description",
                "sample",
                "sample_qty",
                "lab_test_uom"
            ],
            "order_by": "lab_test_name",
            "limit": 50
        }
        
        if or_filters:
            query_args["or_filters"] = or_filters
        
        templates = frappe.get_all(**query_args)
        
        return {
            "status": "success",
            "data": templates,
            "count": len(templates),
            "search_term": search_term,
            "department": department
        }
        
    except Exception as e:
        frappe.log_error(f"Error searching lab test templates: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@frappe.whitelist()
def get_medical_departments():
    """
    Get all medical departments for filtering lab tests
    """
    try:
        departments = frappe.get_all(
            "Medical Department",
            filters={"disabled": 0},
            fields=["name", "department"],
            order_by="department"
        )
        
        return {
            "status": "success",
            "data": departments,
            "count": len(departments)
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching medical departments: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@frappe.whitelist()
def get_suppliers():
    """
    Get all active suppliers
    """
    try:
        suppliers = frappe.get_all(
            "Supplier",
            filters={"disabled": 0},
            fields=[
                "name",
                "supplier_name",
                "supplier_group",
                "mobile_no",
                "email_id",
                "country",
                "supplier_type"
            ],
            order_by="supplier_name"
        )
        
        return {
            "status": "success",
            "data": suppliers,
            "count": len(suppliers)
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching suppliers: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@frappe.whitelist()
def create_diagnostic_order(patient_id, customer_id, tests, notes="", priority="normal"):
    """
    Create a new diagnostic order with selected lab tests
    """
    try:
        if not patient_id or not customer_id or not tests:
            return {
                "status": "error",
                "message": "Patient ID, Customer ID, and tests are required"
            }
        
        # Parse tests if it's a string
        if isinstance(tests, str):
            import json
            tests = json.loads(tests)
        
        # Get patient and customer details
        patient = frappe.get_doc("Patient", patient_id)
        customer = frappe.get_doc("Customer", customer_id)
        
        # Create a Sales Order for the diagnostic tests
        sales_order = frappe.new_doc("Sales Order")
        sales_order.customer = customer_id
        sales_order.order_type = "Sales Order"
        sales_order.delivery_date = frappe.utils.today()
        sales_order.currency = frappe.defaults.get_global_default("currency")
        
        # Add items (lab tests) to the sales order
        total_amount = 0
        for test in tests:
            item = sales_order.append("items", {})
            item.item_code = test.get("name")  # Lab Test Template name
            item.item_name = test.get("lab_test_name")
            item.qty = test.get("quantity", 1)
            item.rate = test.get("lab_test_rate", 0)
            item.amount = item.qty * item.rate
            total_amount += item.amount
        
        # Add custom fields for diagnostic order tracking
        sales_order.custom_patient = patient_id
        sales_order.custom_order_type = "Diagnostic"
        sales_order.custom_priority = priority
        sales_order.custom_notes = notes
        
        # Save the sales order
        sales_order.insert()
        sales_order.submit()
        
        # Create Lab Test records for each test in the order
        lab_tests_created = []
        for test in tests:
            for i in range(test.get("quantity", 1)):
                lab_test = frappe.new_doc("Lab Test")
                lab_test.patient = patient_id
                lab_test.template = test.get("name")
                lab_test.company = frappe.defaults.get_global_default("company")
                lab_test.invoiced = False
                lab_test.custom_sales_order = sales_order.name
                lab_test.custom_priority = priority
                lab_test.custom_notes = notes
                
                lab_test.insert()
                lab_tests_created.append(lab_test.name)
        
        return {
            "status": "success",
            "message": "Diagnostic order created successfully",
            "data": {
                "sales_order": sales_order.name,
                "lab_tests": lab_tests_created,
                "total_amount": total_amount,
                "patient_name": patient.patient_name,
                "customer_name": customer.customer_name
            }
        }
        
    except Exception as e:
        frappe.log_error(f"Error creating diagnostic order: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to create diagnostic order: {str(e)}"
        } 

def fetch_supplier_items_by_name(supplier_name, item_name):
    """
    Fetch items from a supplier by supplier name and item name
    """
    try:
        items = frappe.get_all(
            "Item",
            filters={"supplier": supplier_name, "item_name": ["like", f"%{item_name}%"]},
            fields=["name", "item_name", "item_code", "standard_rate", "item_group", "description", "image"]
            )
        return {
            "status": "success",
            "data": items,
            "count": len(items)
        }
    except Exception as e:
        frappe.log_error(f"Error fetching supplier items: {str(e)}")
        return {
            "status": "error",
            "message": str(e),  
            "data": []
        }
    
@frappe.whitelist()
def fetch_supplier_items(supplier_id):
    """
    Fetch items from a supplier
    """
    try:
        items = frappe.get_all(
            "Item",
            filters={"supplier": supplier_id},
            fields=["name", "item_name", "item_code", "standard_rate", "item_group", "description", "image"]
        )
        return {
            "status": "success",
            "data": items,
            "count": len(items)
        }
    except Exception as e:
        frappe.log_error(f"Error fetching supplier items: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }
    
@frappe.whitelist()
def fetch_item_by_name(item_name):
    """
    Fetch item by name
    """
    try:
        items = frappe.get_all(
            "Item",
            filters={"item_name": ["like", f"%{item_name}%"]},
            fields=["name", "item_name", "item_code", "standard_rate", "item_group", "description", "image"]
        )
        return {
            "status": "success",
            "data": items,
            "count": len(items)
        }
    except Exception as e:
        frappe.log_error(f"Error fetching supplier items: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }
       
@frappe.whitelist()
def fetch_supplier():
    """
    Fetch all suppliers
    """
    try:
        suppliers = frappe.get_all(
            "Supplier",
            filters={"disabled": 0},
            fields=["name", "supplier_name", "supplier_group", "mobile_no", "email_id", "country", "supplier_type"]
        ) 
        return {
            "status": "success",
            "data": suppliers,
            "count": len(suppliers)
        }
    except Exception as e:
        frappe.log_error(f"Error fetching suppliers: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }
    
    
@frappe.whitelist()
def fetch_supplier_by_name(supplier_name):
    """
    Fetch supplier by name
    """
    try:
        items = frappe.get_all(
            "Item",
            filters={"supplier": supplier_name},
            fields=["name", "item_name", "item_code", "standard_rate", "item_group", "description", "image"]
        )
        return {
            "status": "success",
            "data": items,
            "count": len(items)
        }
    except Exception as e:
        frappe.log_error(f"Error fetching supplier items: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }
    
