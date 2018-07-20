const axios = require('axios');
const cherrio = require('cheerio');
const RedisService = require('./redis_service');
const moment = require('moment');

const MongoClient = require('mongodb').MongoClient;
let db;

class Tag {
    constructor(name, score, value) {
        this.name = name;
        this.score = score;
        this.value = value
    }
}



async function spideringArticles(count) {
    const ids = await RedisService.getRandomAcfunIds(count);
    let succeedCount = 0;
    let errCount = 0;
    for(let id of ids){
        await getSingleArticle(id)
            .then(r => {
                succeedCount ++;
            })
            .catch(e => {
                errCount ++;
                if(e.errCode !==4040000 ){
                    throw e
                }
            });
        await new Promise( (rsv) => {
            setTimeout(rsv, 1000)
        })
    }
    return {
        succeedCount,
        errCount
    }
}

async function getSingleArticle(id) {
    // console.log(db);
    if(!db){
        db = await MongoClient.connect('mongodb://localhost:27017/acfun');
    }
    const res = await axios.get(`http://www.acfun.cn/a/ac${id}`)
        .catch(e => {
            if(e.response || e.response.status || e.response.status == 404) {
                const err = new Error('not found');
                err.errCode = 4040000;
                throw err;
            }
        });
    const html = res.data;
    const $ = cherrio.load(html);
    const articleContent = $('.article-content');
    const title = $('.art-title').children('.art-title-head').children('.caption').text();
    const originCreatedAt = moment($('.up-time').text(), 'YYYY年MM月DD日  hh:mm:ss').valueOf();
    const tags = [];

    const articleTagName = $('.art-name').text();

    tags.push(new Tag('ARTICLE_TAG_NAME'), articleTagName, 1);

    const articleCategory = $('.art-census > a').text();

    tags.push(new Tag('ARTICLE_TAG_CAREGORY'), articleCategory, 1);

    const tagSys = $('.art-tags>a').text();

    tags.push(new Tag('ARTICLE_TAG_SYS', tagSys), tagSys, 1);

    const tagHttpRes = await axios.get(`http://www.acfun.cn/member/collect_up_exist.aspx?contentId=${id}`)

    const tagList = tagHttpRes.data.data.tagList;

    for(let tag of tagList) {
        tags.push(new Tag('ARTICLE_TAG_USER', tag.name, 1))
    }

    console.log(tagList);


    if(!articleContent.html()){
        return
    }else{
        await RedisService.markArticleIdSucceed(id)
    }
    const content = [];

    getTextOrImg(articleContent, content);
    function getTextOrImg(dom, arr) {
        const d = $(dom);
        const children = d.children();
        if(children.length === 0){
            if(d.text()){
                arr.push('text',d.text())
            }else if(d[0].name ==='img'){
                arr.push('src',d.attr('src'))
            }
        }else{
            for(let i =0; i<children.length; i++){
                const child = children[i];
                getTextOrImg(child, arr)
            }
        }
        return arr
    }

    const article = {
        acfunId: id,
        content: content,
        articleContentHtml: articleContent.html(),
        createAt: Date.now().valueOf(),
        originCreatedAt: 0,
        title: '',
        tags: tags
    };
    console.log(article)
    // const articles = await db.collection('articles').findOneAndUpdate(
    //     {acfun: id},
    //     {
    //         content: content,
    //         articleContentHtml: articleContent,
    //         createAt: Date.now().valueOf()
    //     },
    //     {
    //         upsert: true,
    //         returnNewValue: true
    //     }
    // )

}

module.exports = {
    spideringArticles,
    getSingleArticle
};


// (async () => {
//     const res = await axios.get('http://www.acfun.cn/a/ac4126053');
//     const html = res.data;
//     const $ = cherrio.load(html);
//     const articleContent = $('.article-content');
//     // const domss = articleContent.find('p>img, div');
//     const content = [];
//     // doms.map((index, value) => {
//     //     const text = $(value).text();
//     //     if(text){
//     //         content.push(text);
//     //     }else if(value.name === 'img'){
//     //         content.push($(value).attr('src'))
//     //     }
//     // });
//
//     getTextOrImg(articleContent, content);
//     function getTextOrImg(dom, arr) {
//         const d = $(dom);
//         const children = d.children();
//         if(children.length === 0){
//             console.log(d[0].name);
//             if(d.text()){
//                 arr.push(d.text())
//             }else if(d[0].name ==='img'){
//                 arr.push(d.attr('src'))
//             }
//         }else{
//             for(let i =0; i<children.length; i++){
//                 const child = children[i];
//                 getTextOrImg(child, arr)
//
//             }
//         }
//         return arr
//     }
//     console.log(content);
// })().then( r => {
//     process.exit(0)
// }).catch(e => {
//     console.log(e);
//     process.exit(1)
// })


