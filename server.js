const {Builder, until} = require('selenium-webdriver');

const fs = require('fs');
let driver = new Builder()
    .forBrowser('chrome')
    .usingServer(process.env.SELENIUM_REMOTE_URL || 'http://localhost:4444/wd/hub')
    .build();

let categoryUrl = "https://www.fahasa.com/sach-trong-nuoc/khoa-hoc-ky-thuat/khoa-hoc-vu-tru/page/2.html";

let argv_url = process.argv[2];
if (argv_url && argv_url.indexOf("taobao.com")) {
    categoryUrl = argv_url;
}

console.log({categoryUrl});
driver.get(categoryUrl)
    .then(() => driver.wait(until.titleContains('FAHASA.COM'), 1000))
    .then(() => driver.executeScript("window.scrollTo(0, document.body.scrollHeight);"))
    .then(() => driver.getPageSource())
    .then((source) => {
        const $ = require('cheerio').load(source);
        getProductElements($).map(ele =>  getPage(ele));
    })
    .then(() => {
        console.log("Complete!!!!!!!!!!!!!!!!!")
        driver.quit();
    });

const getProductElements = ($) => {
    let productEles = [];
    $('.category-products').find('.product-name').each((_, ele) => {
        productEles.push($(ele));
    });
    return productEles;
};

const  getPage = ($) => {
    let url = $.find('a').attr("href");
    let title = $.find('a').attr("title");
    driver.get(url)
    .then(() => driver.wait(until.titleContains('FAHASA.COM'), 1000))
    .then(() => driver.executeScript("window.scrollTo(0, document.body.scrollHeight);"))
    .then(() => driver.getPageSource())
    .then((source) => {
        console.log(url);
        const $ = require('cheerio').load(source,{decodeEntities: false});
        let prods = extractProductInfo($);
        saveText2File(`./temp/products_${title}.json`, JSON.stringify(prods));
    })
    .then(() => {
        //driver.quit();
    });
}

const extractProductInfo = ($) => {
    let title = $('.col-md-7 h1').html();//normalizeText($.find('.row.row-2.title > a').text());
    if(!title)
        title = $('title').text().split(" - ")[0];
    let image = $('.fhs-p-img').attr('src');
    let oldPrice = normalizeText($('.old-price span.price').html());
    let specialPrice = normalizeText($('.special-price span.price').html());
    let discount = $('.label-pro-sale span').html();
    let discriptionTile = $('.short-description span').html();
    let discription = normalizeText($('.short-description').clone().children().remove().end().text());
    let discriptionFull = normalizeText($('#product_tabs_description_contents').clone().children("h2").remove().end().text());
    let tacgia = null;
    let nguoidich = null;
    let nxb = null;
    let namXB = null;
    let trongluong = null;
    let kichthuoc = null;
    let sotrang = null;
    let hinhthuc = null;
    let ngonngu = null;
    $('#product-attribute-specs-table > tbody  > tr').each(function(i, tr) {
        if($(tr).find('.label').text() == "Tác giả"){
            tacgia = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "Người Dịch"){
            nguoidich = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "NXB"){
            nxb = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "Năm XB"){
            namXB = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "Trọng lượng (gr)"){
            trongluong = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "Kích thước (cm)"){
            kichthuoc = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "Số trang"){
            sotrang = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "Hình thức"){
            hinhthuc = normalizeText($(tr).find('.data').html());
        }
        else if($(tr).find('.label').text() == "Ngôn ngữ"){
            ngonngu = normalizeText($(tr).find('.data').html());
        }
    });
    //let price = normalizeText($.find('.price.g_price.g_price-highlight').text());
    //let thumb = $.find('.pic > a > img').attr('src');
    //let link = $.find('.pic > a').attr('href');
    return {
        title,
        image,
        oldPrice,
        specialPrice,
        discount,
        discriptionTile,
        discription,
        discriptionFull,
        tacgia,
        nguoidich,
        nxb,
        namXB,
        trongluong,
        kichthuoc,
        sotrang,
        hinhthuc,
        ngonngu,
    };
};

const normalizeText = (text) => {
    if(text == null) return null;
    return text.replace(/\\n/g, '').trim();
};

const saveText2File = (filepath, text) => {
    fs.writeFile(filepath, text, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
};


