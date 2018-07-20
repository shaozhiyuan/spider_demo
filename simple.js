const http = require("http");
const server = http.createServer();
const qs = require("querystring");

server
    .on("request", (req, res) => {
        console.log(req);
        const url = req.url;
        const queryString = url.substr(url.indexOf("?") + 1, url.length);
        const query = qs.parse(queryString);
        const path = url.substr(0, url.indexOf('?'));
        switch (path) {
            case '/user':
                switch (req.method) {
                    case 'GET':
                        res.statusCode = 200;
                        res.end("get");
                        break;
                    case 'POST':
                        let dataCount = 0;
                        let requestBodyStr = '';
                        req.on('data', (data) => {
                            requestBodyStr += data.toString();
                            dataCount += 1;
                            console.log(requestBodyStr)
                        });
                        res.end("post");
                        break;
                }
                break;
            default:
                res.end('wrong');
                break;
        }
    })
    .listen(8080);
