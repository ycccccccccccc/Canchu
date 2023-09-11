const redis = require('redis');
const client = process.env.SERVER === 'local'
    ? redis.createClient()
    : redis.createClient({ url: 'redis://redis:6379' });

// 如果有錯誤，輸出錯誤訊息
client.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});
client.connect();


// // 使用 promisify 將 TTL 方法轉換為 Promise 形式
// const ttlAsync = promisify(client.ttl).bind(client);

const get_cache = async (key) => {
    try {
        const result = await client.get(key);
        return JSON.parse(result);
    } catch (error) {
        console.error('Error getting cache:', error);
    }
}

const set_cache = async (key, payload, expire_time) => {
    try {
        if(expire_time){
            await client.SETEX(key, expire_time, JSON.stringify(payload)); // s
        }
        else{
            await client.SETEX(key, 3600,  JSON.stringify(payload));
        }
        console.log('Cache set successfully.');
      } catch (error) {
        console.error('Error setting cache:', error);
      }
}

const plus_one_cache = async(key) => {
    try{
        await client.INCR(key);

    } catch {
        console.error('Error setting cache:', error);
    }
}

const del_cache = async (key) => {
    try {
        await client.del(key);
        console.log('Cache del successfully.');
      } catch (error) {
        console.error('Error setting cache:', error);
      }
}

module.exports = {
    get_cache,
    set_cache,
    del_cache,
    plus_one_cache,
}
