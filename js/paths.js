/* Every internal link in one place. ROOT is set by a one-line inline
   script at the top of each page ("" for index.html at the site root,
   "../" for every page inside /pages) so the same relative paths work
   whether the site is opened straight from disk or hosted on a server. */
function paths(){
  const R = typeof ROOT === "string" ? ROOT : "";
  return {
    home: R+"index.html",
    menu: R+"pages/menu.html",
    branches: R+"pages/branches.html",
    offers: R+"pages/offers.html",
    about: R+"pages/about.html",
    contact: R+"pages/contact.html",
    cart: R+"pages/cart.html",
    checkout: R+"pages/checkout.html",
    login: R+"pages/login.html",
    signup: R+"pages/signup.html",
    account: R+"pages/account.html",
    order: R+"pages/order-tracking.html",
    confirmation: R+"pages/confirmation.html",
    adminDashboard: R+"pages/admin-dashboard.html",
    adminOrders: R+"pages/admin-orders.html",
    adminMenu: R+"pages/admin-menu.html",
    adminCategories: R+"pages/admin-categories.html",
    adminBranches: R+"pages/admin-branches.html",
    adminCustomers: R+"pages/admin-customers.html",
    adminOffers: R+"pages/admin-offers.html",
    adminReviews: R+"pages/admin-reviews.html",
    adminSettings: R+"pages/admin-settings.html",
    managerDashboard: R+"pages/manager-dashboard.html",
    managerOrders: R+"pages/manager-orders.html"
  };
}
