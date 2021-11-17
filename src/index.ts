require('dotenv').config()
const fs = require('fs');
const path = require( 'path' );

import { URL } from './interfaces';
import fetch from 'node-fetch';

enum Cluster {
    caitlyn = 'caitlyn',
    maokai = 'maokai',
    trundle = 'trundle',
    sion = 'sion',
    poppy = 'poppy',
    twitch = 'twitch'
};

/**
 * For the HTTP requests
 */
var option = {
    headers: {
        'user-agent': process.env.USER_AGENT ? process.env.USER_AGENT : '',
        host: '',
        authority: '',
        'blog-version': 'wp',
    },
    method: 'GET',
};

const clusters = {
    caitlyn: {
        urlRaw: path.relative('' , './data/caitlyn/url.txt'),
        host: 'www.comparehero.my',
        authority: 'www.comparehero.my'
    },
    maokai: {
        urlRaw: path.relative('' , './data/maokai/url.txt'),
        host: 'www.moneyhero.com.hk',
        authority: 'www.moneyhero.com.hk'
    },
    trundle: {
        urlRaw: path.relative('' , './data/trundle/url.txt'),
        host: 'www.moneyguru.co.th',
        authority: 'www.moneyguru.co.th'
    },
    sion: {
        urlRaw: path.relative('' , './data/sion/url.txt'),
        host: 'www.singsaver.com.sg',
        authority: 'www.singsaver.com.sg'
    },
    poppy: {
        urlRaw: path.relative('' , './data/poppy/url.txt'),
        host: 'www.moneymax.ph',
        authority: 'www.moneymax.ph'
    },
    twitch: {
        urlRaw: path.relative('' , './data/twitch/url.txt'),
        host: 'www.money101.com.tw',
        authority: 'www.money101.com.tw'
    }
}

function writeToFile(fileName: string, data: any[]) {
    fs.writeFile(fileName, JSON.stringify(data), function (err: any) {
        if (err) return console.log(err);
        console.log('succesfully written');
    });
}

/**
 * 
 * @param cluster 
 * @returns an object with grouped URLs and the amount of times they were repeated
 */
async function mapUrls(cluster: Cluster) {
    let clr = cluster.toString() as keyof typeof clusters;
    let url_map = [] as URL[];
    let data = await fs.readFileSync(clusters[clr].urlRaw, {encoding:'utf8', flag:'r'});
    data = data.split("\n");
    let url_unit = '';
    let count = 1;
    for (let i = 1; i < data.length; i++) {
        if (data[i] === data[i-1]) {
            count++;
        } else {
            url_unit = data[i-1];
            let unit = {
                url: url_unit,
                count
            };
            url_map.push(unit);
            count = 1;
        }
    };
    return url_map;
}

/**
 * This function creates a JSON file with a list of the URLs that responded with an error 
 * in a specific cluster.
 * 
 * The function will count and group the URLs that are the same, and then it will
 * make a call to the URL to check if the response is truly an error.
 * 
 * @example orderAndFetch(Cluster.trundle)
 * @result
 *  {
 *    "url": "http://www.comparehero.my/articles/feed/page/1?",
 *    "count": 193,
 *    "response": 404
 *  }
 * 
 * @param cluster 
 */
async function orderAndFetch(cluster: Cluster) {

    if (!process.env.USER_AGENT) 
         throw new Error("Provide user agent in the .env file");

    let clr = cluster.toString() as keyof typeof clusters;

    option.headers.host = clusters[clr].host;
    option.headers.authority = clusters[clr].authority;

    let data = await mapUrls(cluster);

    let orderedData = [];
    let dataCopy = [...data];

    while (orderedData.length < data.length) {
        let unit = {
            url: '',
            count: 0,
            response: 999
        };
        let index = 0;

        dataCopy.forEach((d, i) => {
            if (d.count > unit.count) {
                unit.count = d.count;
                unit.url = d.url;
                index = i;
            } 
        });

        await fetch(unit.url, option)
            .then(res => {
                unit.response = res.status;
                console.log(res.status);
            })
            .catch(err => {
                unit.response = err.status;
            })
        orderedData.push(unit);
        dataCopy.splice(index, 1);
    }
    
    let fileName: string = './data/' + cluster.toString() + '/' + cluster.toString() + 'Data.json';
    writeToFile(fileName, orderedData);
}

/**
 * Call the function with the specified cluster
 */
orderAndFetch(Cluster.sion);