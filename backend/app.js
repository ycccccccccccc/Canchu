const express = require('express');
const app = express();
const cors = require('cors');
const router_post = require('./server/routes/routes_post');
const router_user = require('./server/routes/routes_user')
const router_friend = require('./server/routes/routes_friendship')
const router_event = require('./server/routes/routes_event')
const router_group = require('./server/routes/routes_group')
const router_chat = require('./server/routes/routes_chat')

let port = process.env.NODE_ENV === 'test' ? 3001 : 3000;

const rateLimit = require("express-rate-limit");
const { rate_limit } = require('./util/ratelimit');

const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 分鐘
    max: 100,
    message: '操作過於頻繁，請稍候！'
});

// 將 rate limit 中間件加入應用程式
// app.use(globalLimiter);

app.use(cors());

app.set('trust proxy', true); //獲取原始 IP 地址


if(process.env.NODE_ENV !== 'stress-test'){
  app.use(rate_limit);
}
else{

}

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use('/api/1.0', router_post);

app.use('/api/1.0', router_user);

app.use('/api/1.0', router_friend);

app.use('/api/1.0', router_event);

app.use('/api/1.0', router_group);

app.use('/api/1.0', router_chat);

// For Load Balancer
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Load balancing check!!'
  });
});


//For unit test!!!!
module.exports = app;