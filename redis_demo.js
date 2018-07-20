const Redis = require('ioredis');

const redis = new Redis;

(async () => {
    const hgetall = await redis.hgetall('hash1');
    const getabc = await redis.get('abc');
    console.log(hgetall)
    console.log(getabc)
 })()
     .then( (r) => {
     })
     .catch( (e)=> {
     });


