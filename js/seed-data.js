/* Sample data used to populate the site the first time it runs in a
   browser. Everything here only matters until localStorage has its own
   copy — see store.js. */

function seedMenuOnly(){
  // duplicated minimal structure so orders can reference prices during seeding
  return [
    {id:"f1",name:"Margherita al Forno",price:590,art:"pizza_margherita",sizes:[{name:"Regular",delta:0},{name:"Large",delta:180},{name:"Family",delta:340}]},
    {id:"f2",name:"Smoked Pepperoni Supreme",price:690,art:"pizza_pepperoni",sizes:[{name:"Regular",delta:0},{name:"Large",delta:180},{name:"Family",delta:340}]},
    {id:"f4",name:"The Oak Smash Burger",price:520,art:"burger_smash",sizes:[]},
    {id:"f6",name:"Half Rotisserie Chicken",price:650,art:"chicken_rotisserie",sizes:[]},
    {id:"f8",name:"Tagliatelle al Ragù",price:560,art:"pasta_ragu",sizes:[]},
    {id:"f10",name:"Smoked Beef Tehari",price:480,art:"rice_tehari",sizes:[]},
    {id:"f14",name:"Wood-Fired Garlic Bread",price:180,art:"bread",sizes:[]},
    {id:"f15",name:"Molten Chocolate Fondant",price:290,art:"chocolate_fondant",sizes:[]},
    {id:"f16",name:"Basque Burnt Cheesecake",price:270,art:"cheesecake",sizes:[]},
    {id:"f17",name:"Charcoal Lemonade",price:180,art:"lemonade",sizes:[]},
    {id:"f18",name:"Cold Brew Espresso Tonic",price:220,art:"espresso_tonic",sizes:[]},
  ];
}

function mkOrder(id,customerId,customerName,mobile,address,branchId,type,itemDefs,status,date){
  const items = itemDefs.map(([foodId,size,variant,qty])=>{
    const f = SEED_MENU_LOOKUP[foodId];
    const sizeDelta = size ? (f.sizes.find(s=>s.name===size)||{delta:0}).delta : 0;
    const unit = f.price + sizeDelta;
    return {foodId, name:f.name, art:f.art, size:size||null, variant:variant||null, qty, unitPrice:unit, subtotal:unit*qty};
  });
  const subtotal = items.reduce((s,i)=>s+i.subtotal,0);
  const deliveryFee = type==="delivery" ? 80 : 0;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  return {id, customerId, customerName, mobile, address, branchId, type, items, subtotal, discount, deliveryFee, total, status, paymentMethod: type==="delivery"?"Cash on Delivery":"Pay at Restaurant", date};
}

function daysAgo(n){return new Date(Date.now()-n*86400000).toISOString();}

function daysAhead(n){return new Date(Date.now()+n*86400000).toISOString();}

function hoursAgo(n){return new Date(Date.now()-n*3600000).toISOString();}

function hashPW(pw){ try{ return btoa(unescape(encodeURIComponent("eo::"+pw))); }catch(e){return pw;} }

function verifyPW(pw,hash){ return hashPW(pw)===hash; }

let SEED_MENU_LOOKUP = {};

function seedData(){
  const categories = [
    {id:"cat-pizza", name:"Wood-Fired Pizza", enabled:true, order:1},
    {id:"cat-burger", name:"Char-Grilled Burgers", enabled:true, order:2},
    {id:"cat-chicken", name:"Rotisserie Chicken", enabled:true, order:3},
    {id:"cat-pasta", name:"Handmade Pasta", enabled:true, order:4},
    {id:"cat-rice", name:"Rice & Grills", enabled:true, order:5},
    {id:"cat-small", name:"Small Plates", enabled:true, order:6},
    {id:"cat-dessert", name:"Desserts", enabled:true, order:7},
    {id:"cat-drinks", name:"Beverages", enabled:true, order:8},
  ];

  const menu = [
    {id:"f1", name:"Margherita al Forno", category:"cat-pizza", price:590, desc:"San Marzano tomato, fior di latte, torn basil, first-press olive oil.", art:"pizza_margherita", rating:4.8, prepTime:16, featured:true, popular:true, available:true, sizes:[{name:"Regular",delta:0},{name:"Large",delta:180},{name:"Family",delta:340}], variants:[]},
    {id:"f2", name:"Smoked Pepperoni Supreme", category:"cat-pizza", price:690, desc:"Double pepperoni, smoked chili oil, aged mozzarella.", art:"pizza_pepperoni", rating:4.7, prepTime:18, featured:true, popular:true, available:true, sizes:[{name:"Regular",delta:0},{name:"Large",delta:180},{name:"Family",delta:340}], variants:[]},
    {id:"f3", name:"Wild Mushroom & Truffle", category:"cat-pizza", price:790, desc:"Roasted wild mushrooms, taleggio, truffle honey drizzle.", art:"pizza_truffle", rating:4.9, prepTime:19, featured:true, popular:false, available:true, sizes:[{name:"Regular",delta:0},{name:"Large",delta:200}], variants:[]},
    {id:"f4", name:"The Oak Smash Burger", category:"cat-burger", price:520, desc:"Double smashed patty, aged cheddar, oak-smoked bacon, burnt-ends sauce.", art:"burger_smash", rating:4.7, prepTime:14, featured:true, popular:true, available:true, sizes:[], variants:[{name:"Regular"},{name:"Extra Patty (+180)"}]},
    {id:"f5", name:"Charred Chicken Burger", category:"cat-burger", price:470, desc:"Buttermilk fried thigh, pickled slaw, chipotle mayo, brioche bun.", art:"burger_chicken", rating:4.5, prepTime:13, featured:false, popular:true, available:true, sizes:[], variants:[{name:"Mild"},{name:"Spicy"}]},
    {id:"f6", name:"Half Rotisserie Chicken", category:"cat-chicken", price:650, desc:"Slow-turned over embers, herb butter baste, garlic jus.", art:"chicken_rotisserie", rating:4.8, prepTime:25, featured:true, popular:true, available:true, sizes:[], variants:[{name:"Mild"},{name:"Medium"},{name:"Hot"}]},
    {id:"f7", name:"Peri-Peri Wings (8pc)", category:"cat-chicken", price:420, desc:"Flame-grilled wings, house peri-peri glaze, lime.", art:"wings", rating:4.6, prepTime:15, featured:false, popular:true, available:true, sizes:[], variants:[{name:"Mild"},{name:"Medium"},{name:"Hot"}]},
    {id:"f8", name:"Tagliatelle al Ragù", category:"cat-pasta", price:560, desc:"12-hour beef & pork ragù, hand-rolled tagliatelle, pecorino.", art:"pasta_ragu", rating:4.7, prepTime:17, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f9", name:"Truffle Mushroom Fettuccine", category:"cat-pasta", price:610, desc:"Cream sauce, wild mushrooms, black truffle shavings.", art:"pasta_truffle", rating:4.8, prepTime:17, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f10", name:"Smoked Beef Tehari", category:"cat-rice", price:480, desc:"Slow-smoked beef shank, fragrant kalojeera rice, fried onion.", art:"rice_tehari", rating:4.9, prepTime:22, featured:true, popular:true, available:true, sizes:[], variants:[]},
    {id:"f11", name:"Grilled Salmon & Rice", category:"cat-rice", price:820, desc:"Char-grilled salmon, saffron rice, lemon-caper butter.", art:"salmon_rice", rating:4.6, prepTime:20, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f12", name:"Charred Corn Elote", category:"cat-small", price:220, desc:"Grilled corn, chili-lime crema, cotija, coriander.", art:"corn", rating:4.4, prepTime:10, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f13", name:"Burrata & Heirloom Tomato", category:"cat-small", price:390, desc:"Creamy burrata, heirloom tomatoes, basil oil, sourdough crisp.", art:"burrata", rating:4.7, prepTime:8, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f14", name:"Wood-Fired Garlic Bread", category:"cat-small", price:180, desc:"Charred sourdough, garlic-herb butter, parmesan.", art:"bread", rating:4.5, prepTime:9, featured:false, popular:true, available:true, sizes:[], variants:[]},
    {id:"f15", name:"Molten Chocolate Fondant", category:"cat-dessert", price:290, desc:"Valrhona dark chocolate, vanilla bean ice cream.", art:"chocolate_fondant", rating:4.9, prepTime:14, featured:true, popular:true, available:true, sizes:[], variants:[]},
    {id:"f16", name:"Basque Burnt Cheesecake", category:"cat-dessert", price:270, desc:"Caramelised top, silky centre, sea-salt crumb.", art:"cheesecake", rating:4.8, prepTime:5, featured:false, popular:true, available:true, sizes:[], variants:[]},
    {id:"f17", name:"Charcoal Lemonade", category:"cat-drinks", price:180, desc:"Activated charcoal, fresh lemon, mint, soda.", art:"lemonade", rating:4.3, prepTime:5, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f18", name:"Cold Brew Espresso Tonic", category:"cat-drinks", price:220, desc:"Double espresso, tonic water, orange peel.", art:"espresso_tonic", rating:4.6, prepTime:5, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f19", name:"House Berry Mocktail", category:"cat-drinks", price:200, desc:"Mixed berries, basil, soda, lime.", art:"mocktail", rating:4.4, prepTime:5, featured:false, popular:false, available:true, sizes:[], variants:[]},
    {id:"f20", name:"Grilled Lamb Chops", category:"cat-rice", price:990, desc:"Herb-marinated lamb chops, saffron pilaf, mint yoghurt.", art:"lamb_chops", rating:4.9, prepTime:24, featured:true, popular:false, available:false, sizes:[], variants:[]},
  ];

  const branches = [
    {id:"br1", name:"Gulshan Flagship", address:"House 12, Road 90, Gulshan 2, Dhaka", phone:"+880 1711-223344", email:"gulshan@emberandoak.com", lat:23.7925, lng:90.4078, openTime:"11:00", closeTime:"23:00", delivery:true, takeaway:true, active:true, deliveryFee:80, deliveryRadiusKm:8},
    {id:"br2", name:"Dhanmondi Lakeside", address:"Road 8/A, Dhanmondi, Dhaka", phone:"+880 1711-556677", email:"dhanmondi@emberandoak.com", lat:23.7461, lng:90.3742, openTime:"11:00", closeTime:"22:30", delivery:true, takeaway:true, active:true, deliveryFee:70, deliveryRadiusKm:7},
    {id:"br3", name:"Banani Heights", address:"Road 11, Banani, Dhaka", phone:"+880 1711-889900", email:"banani@emberandoak.com", lat:23.7936, lng:90.4066, openTime:"12:00", closeTime:"23:30", delivery:true, takeaway:false, active:true, deliveryFee:90, deliveryRadiusKm:6},
    {id:"br4", name:"Chattogram Agrabad", address:"Sheikh Mujib Road, Agrabad, Chattogram", phone:"+880 1811-334455", email:"agrabad@emberandoak.com", lat:22.3277, lng:91.8123, openTime:"11:00", closeTime:"22:00", delivery:true, takeaway:true, active:true, deliveryFee:60, deliveryRadiusKm:9},
  ];

  const users = [
    {id:"u-admin", name:"Rafiq Ahmed", email:"admin@emberandoak.com", mobile:"01711000001", address:"Gulshan, Dhaka", password:"", role:"admin", branchId:null, status:"active", createdAt:daysAgo(400)},
    {id:"u-manager", name:"Nusrat Jahan", email:"manager@emberandoak.com", mobile:"01711000002", address:"Dhanmondi, Dhaka", password:hashPW("manager123"), role:"manager", branchId:"br1", status:"active", createdAt:daysAgo(300)},
    {id:"u-cust1", name:"Tanvir Hasan", email:"customer@example.com", mobile:"01911000003", address:"Road 5, Banani, Dhaka", password:hashPW("customer123"), role:"customer", branchId:null, status:"active", createdAt:daysAgo(120)},
    {id:"u-cust2", name:"Farhana Islam", email:"farhana@example.com", mobile:"01911000004", address:"Agrabad, Chattogram", password:hashPW("customer123"), role:"customer", branchId:null, status:"active", createdAt:daysAgo(60)},
  ];

  const offers = [
    {id:"off1", title:"Welcome Offer", desc:"10% off your first order with us.", type:"percentage", value:10, minOrder:500, code:"WELCOME10", startDate:daysAgo(60), endDate:daysAhead(120), active:true, usageLimit:500, used:38},
    {id:"off2", title:"Family Feast Deal", desc:"Flat ৳200 off orders above ৳1500.", type:"fixed", value:200, minOrder:1500, code:"FLAT200", startDate:daysAgo(20), endDate:daysAhead(40), active:true, usageLimit:200, used:12},
    {id:"off3", title:"Founders' Week (Ended)", desc:"15% off sitewide — founders' week only.", type:"percentage", value:15, minOrder:0, code:"FOUNDERS15", startDate:daysAgo(200), endDate:daysAgo(190), active:false, usageLimit:1000, used:410},
  ];

  const orders = [
    mkOrder("ORD-1001","u-cust1","Tanvir Hasan","01911000003","Road 5, Banani, Dhaka","br3","delivery",[["f1","Regular",null,1],["f14",null,null,2]],"completed",daysAgo(9)),
    mkOrder("ORD-1002","u-cust1","Tanvir Hasan","01911000003","Road 5, Banani, Dhaka","br1","takeaway",[["f10",null,null,1],["f18",null,null,1]],"completed",daysAgo(5)),
    mkOrder("ORD-1003","u-cust1","Tanvir Hasan","01911000003","Road 5, Banani, Dhaka","br1","delivery",[["f4",null,"Regular",2],["f15",null,null,1]],"preparing",hoursAgo(1)),
    mkOrder("ORD-1004","u-cust2","Farhana Islam","01911000004","Agrabad, Chattogram","br4","delivery",[["f6",null,"Hot",1],["f17",null,null,2]],"out_for_delivery",hoursAgo(0.4)),
    mkOrder("ORD-1005","u-cust2","Farhana Islam","01911000004","Agrabad, Chattogram","br4","takeaway",[["f2","Large",null,1]],"pending",hoursAgo(0.05)),
    mkOrder("ORD-1006","u-cust1","Tanvir Hasan","01911000003","Road 5, Banani, Dhaka","br2","delivery",[["f8",null,null,1],["f16",null,null,1]],"cancelled",daysAgo(20)),
  ];

  const reviews = [
    {id:"rv1", customerId:"u-cust1", customerName:"Tanvir Hasan", foodId:"f1", rating:5, comment:"Best margherita in the city — the crust has real char.", date:daysAgo(8)},
    {id:"rv2", customerId:"u-cust2", customerName:"Farhana Islam", foodId:"f10", rating:5, comment:"The smoked beef tehari is unreal. Ordering again this week.", date:daysAgo(4)},
    {id:"rv3", customerId:"u-cust1", customerName:"Tanvir Hasan", foodId:"f4", rating:4, comment:"Great burger, wish the fries portion was bigger.", date:daysAgo(4)},
  ];

  const notifications = [
    {id:"n1", userId:"u-cust1", title:"Order confirmed", message:"Your order ORD-1003 is being prepared.", read:false, date:hoursAgo(1)},
    {id:"n2", userId:"u-cust2", title:"Out for delivery", message:"ORD-1004 is on its way to you.", read:false, date:hoursAgo(0.4)},
    {id:"n3", userId:"u-admin", title:"New order", message:"New order ORD-1005 placed at Chattogram Agrabad.", read:false, date:hoursAgo(0.05)},
    {id:"n4", userId:"u-manager", title:"New order", message:"New order ORD-1005 needs confirmation.", read:false, date:hoursAgo(0.05)},
  ];

  return {config:DEFAULT_CONFIG, categories, menu, branches, users, offers, orders, reviews, notifications, favorites:{}, cart:[], selectedBranchId:null, orderType:null, appliedCoupon:null, currentUserId:null};
}
