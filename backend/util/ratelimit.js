const redis = require('redis');
const { set_cache, get_cache, plus_one_cache } = require('./cache');
const client = process.env.SERVER === 'local'
    ? redis.createClient()
    : redis.createClient({ url: 'redis://redis:6379' });

// 如果有錯誤，輸出錯誤訊息
client.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});
client.connect();

const limit = 60;
const stop_time = 1; //(s)
const rate_limit = async (req, res, next) => {
    try {
        const ip = req.ip;
        let number = await get_cache(ip);

        // 若不存在此 ip
        if(number == null){
            number = 0;
            await set_cache(ip, parseInt(number)+1, stop_time);
        }
        else if(number !== false){
            // 設為黑名單
            if(parseInt(number) >= limit){
                await set_cache(ip, false, stop_time);
            }
            // update 呼叫 api 次數
            else{
                await plus_one_cache(ip);
            }
        }
        // false => 超過設定的 ratelimit
        else{
            return res.status(429).json({
                message: '操作過於頻繁，請稍候！'
            })
        }
        next();
    } catch (err) {
        return res.status(500).json({
            message: 'Rate limit erorr!!!!'
        })
    }
}

module.exports = {
    rate_limit
}