/* Simple in-app notification log stored on DB.notifications. */

function pushNotification(userId,title,message){
  DB.notifications.unshift({id:uid("n"), userId, title, message, read:false, date:new Date().toISOString()});
}

function markAllRead(userId){
  DB.notifications.forEach(n=>{ if(n.userId===userId) n.read=true; });
  saveDB();
  if(typeof onNotificationsChanged==="function") onNotificationsChanged();
}
