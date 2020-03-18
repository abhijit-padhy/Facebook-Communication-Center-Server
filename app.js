const express=require('express'); 
var cors = require('cors')
const socketIO=require('socket.io'); 
const http=require('http')
const port=process.env.PORT||4001 
const routes = require('./routes/index');

var app=express();
app.use(cors())
app.use(routes);

let server = http.createServer(app) 
var io=socketIO(server); 

//Used to store all feed data
var feeds = {};

let interval;
// make connection with user from server side 
io.on('connection', (socket)=>{ 
  console.log('New user connected'); 
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => emitComments(socket), 2000);
  
  // listen for message from user 
  socket.on('createMessage', (newMessage)=>{ 
    console.log('newMessage', newMessage);
    createMessage(newMessage);
  }); 
  
  // when server disconnects from user 
  socket.on('disconnect', () => { 
    console.log('disconnected from user'); 
  }); 
}); 

/**
 * Used to emit comment from server to client
 * @param {*} socket 
 */
const emitComments = socket => {
  socket.emit('comments', feeds);
}

// Used to recieve message from client to server.
// Most of the ids are randomly generated.
// There might be chance of duplicacy
const createMessage = (data) => {
  if (data && data.text) {
    let {text, feedID, cId} = data;
    // Checks if feedId exists else consider text as a new feed and
    // assigns new feedID to it
    if (feedID) {
      // Checks if cId exits then it considers the text as a reply to that comment
      // else assigns a new comment id (cId) to it
      if (cId) {
        let obj = {
          replyBy: Math.ceil((Math.random()+1)*10000),
          reply: text,
          date: new Date()
        }
        if (!feeds[feedID].comments[cId].replies) {
          feeds[feedID].comments[cId].replies = [];
        }
        feeds[feedID].comments[cId].replies.push(obj);
      } else {
        let comments = feeds[feedID].comments;
        let _cId = "c" + (comments ? (Object.keys(comments).length + 1) : 1);
        let obj = {
          cId: _cId,
          comment: text,
          commentBy: Math.ceil((Math.random()+1)*10000),
          date: new Date()
        }
        if (!comments) {
          feeds[feedID].comments = {};
        }
        feeds[feedID].comments[_cId] = {...obj};
      }
    } else {
      let _feedId = Math.ceil((Math.random()+1)*10000);
      let obj = {
        feedID: _feedId,
        feedBy: _feedId,
        feed: text,
        date: new Date(),
      }
      feeds[_feedId] = {...obj};
    }
  }
}
  
server.listen(port);


// var feeds = {
//   123: { //feedID
//     feedID: 123,
//     feedBy: "Abhijit Padhy",
//     feed: "My first feed",
//     date: new Date(),
//     comments: {
//       c1: {
//         cId: "c1",
//         comment: "How u doing!!",
//         commentBy: "John Doe",
//         date: new Date(),
//         replies: [
//           {
//             replyBy: "tiger D",
//             reply: "Tiger D Luffy",
//             date: new Date()
//           },
//           {
//             replyBy: "tiger F",
//             reply: "It was a nice day. Having tea party wid frnds. #Chilllout",
//             date: new Date()
//           }
//         ]
//       },
//       c2: {
//         cId: "c2",
//         comment: "How u doing!!",
//         commentBy: "John Doe",
//         date: new Date(),
//         replies: [
//           {
//             replyBy: "tiger D",
//             reply: "Tiger D Luffy",
//             date: new Date()
//           },
//           {
//             replyBy: "Jackie San",
//             reply: "Tiger D San d halo",
//             date: new Date()
//           }
//         ]
//       }
//     }
//   },
//   534: {
//     feedID: 534,
//     feedBy: "John Cena",
//     feed: "Do you think people going through hello world!",
//     date: new Date(),
//   }
// }