const Redis = require('ioredis');
const redis = new Redis;

const ACFUN_ID_SET_REDIS_KEY = 'acfun_id_set';
const ACFUN_ARTICLE_GOT_ID_SET = 'acfun_article_got_id_set';
async function generateAcfunIdsToRedis(min, max) {
    for(let i = min; i < max; i++){
        const arr = new Array(10000);
        for(let j = 0; j < 10000; j++){
            arr.push(i*10000+j)
        }
        await redis.sadd(ACFUN_ID_SET_REDIS_KEY, arr);
    }
}

async function getRandomAcfunIds(count) {
    const ids = await redis.spop(ACFUN_ID_SET_REDIS_KEY, count);
    return ids
}

async function markArticleIdSucceed(id) {
    await redis.sadd(ACFUN_ARTICLE_GOT_ID_SET, id);
}

async function idBackInPool(id) {
    await redis.sadd(ACFUN_ARTICLE_GOT_ID_SET, id);
}

async function getRemainingIDCount() {
    return await redis.scard(ACFUN_ID_SET_REDIS_KEY)
        .then(r => Number(r))
}

module.exports = {
    generateAcfunIdsToRedis,
    markArticleIdSucceed,
    getRandomAcfunIds,
    idBackInPool,
    getRemainingIDCount
};

