/* Order status pipeline, shared by the tracking page, account order
   history and the admin/manager order tools. */

const STATUS_FLOW_DELIVERY = ["pending","confirmed","preparing","out_for_delivery","completed"];

const STATUS_FLOW_TAKEAWAY = ["pending","confirmed","preparing","ready","completed"];

const STATUS_LABELS = {pending:"Order Placed", confirmed:"Confirmed", preparing:"Preparing", ready:"Ready for Pickup", out_for_delivery:"Out for Delivery", completed:"Completed", cancelled:"Cancelled"};
