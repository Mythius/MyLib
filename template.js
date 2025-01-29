const { read } = require("fs");
const { file } = require("./file.js");
const { decode } = require("punycode");

function readConfigFile() {
  return new Promise((res) => {
    file.read(
      "page.json",
      (data) => {
        res(JSON.parse(data));
      },
      (error) => {
        res({});
      }
    );
  });
}

exports.generateHTML = async function (req, res) {
  let HTML = "<h1>Not Found</h1>";
  
  HTML = await getPageHTML(req.url.slice(1).toLowerCase());

  res.set("Content-Type", "text/html");
  res.send(Buffer.from(HTML));
};

function getPageIndex(siteData, name = "") {
  let page = siteData.pages.filter((e) => e.title.toLowerCase() == name);
  if (page && page[0]) return siteData.pages.indexOf(page[0]);
  return 0;
}

async function getPageHTML(url) {
  let siteData = await readConfigFile();
  if(JSON.stringify(siteData) == '{}') return '<h1>No Config</h1>';
  let pageIx = getPageIndex(siteData, decodeURI(url));
  const template = /*html*/`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${siteData.title}</title>
            <link rel="icon" type="image/x-icon" href="assets/${siteData.icon}">
            <link rel="stylesheet" href="style.css">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        </head>
        <body>
            <nav>
                <img id="logo" src="assets/${siteData.logo}">
                <div id=spacer></div>
                ${getNavTitlesAndLinks(siteData)}
            </nav>
            <main>
            ${getAllComponents(siteData.pages[pageIx]?.components)}</main>
            <div></div>
            <footer>
            ${generateFooterComponents(siteData.footer)}
            </footer>
        </body>
        </html>
    `;
  return template;
}

function getNavTitlesAndLinks(siteData) {
  let data = siteData.pages.map((e) => {
    return { title: e.title, url: e.url ? e.url : `/${e.title.toLowerCase()}`, type:e.type };
  });
  let HTML = data.map(e=> /*html*/`<a ${e.type=='link'?'target="_blank"':""} href="${e.url}">${e.title}</a>`)
  return HTML.join('');
}

function getAllComponents(components){
    if(!components) return;
    let result = '';
    for(let c of components){
        if(c.type == 'carousel') result += generateCarouselComponent(c);
        if(c.type == 'section') result += generateImageTextComponent(c);
        if(c.type == 'embed') result += generateEmbeded(c);
    }
    return result;
}

function generateCarouselComponent(carousel_component) {
    let c = 0;
    let d = 0;
    function generateSlide(url){
        c++;
        return  /*html*/`
        <div class="item ${c==1?'active':''}">
            <img src="assets/${url}" alt="${url.split('.')[0]}" style="width:100%;">
        </div>`;
    }    
    function generateDot(){
        return  /*html*/`
        <li data-target="#carousel1" data-slide-to="${d++}" ${d==1?'class="active"':''}></li>
        `;
    }
    let title = carousel_component.text?`<h2>${carousel_component.text}</h2>`:'';
    return  /*html*/`
    <div class="container">
    ${title}  
    <div id="carousel1" class="carousel slide" data-ride="carousel">
        <!-- Indicators -->
        <ol class="carousel-indicators">
        ${carousel_component.assets.map(e=>generateDot()).join('')}
        </ol>

        <!-- Wrapper for slides -->
        <div class="carousel-inner">
        ${carousel_component.assets.map(e=>generateSlide(e)).join('')}
        </div>

        <!-- Left and right controls -->
        <a class="left carousel-control" href="#carousel1" data-slide="prev">
        <span class="glyphicon glyphicon-chevron-left"></span>
        <span class="sr-only">Previous</span>
        </a>
        <a class="right carousel-control" href="#carousel1" data-slide="next">
        <span class="glyphicon glyphicon-chevron-right"></span>
        <span class="sr-only">Next</span>
        </a>
    </div>
    </div>
    `;
}

function generateEmbeded(data){
    let title = data.title ? `<h3>${data.title}</h3>` : '';
    return  /*html*/`
        <div class="container">
            <div class="section">
                ${title}
                <br>
                ${decodeURI(data.text)}
            </div>
        </div>
    `
}

function generateImageTextComponent(data) {
    let img = data.image ? `<img src="assets/${data.image}">` : '';
    return  /*html*/`
        <div class="container">
            <div class="section">
                <h3>${data.header}</h3>
                <p>${data.text}</p>
                ${img}
            </div>
        </div>
    `
}

function generateFooterComponents(footer){
    function genComps(comps){
        if(!comps) return '';
        let result = '';
        for(let c of comps){
            if(c.type=='link') result += genFooterLink(c);
            if(c.type=='contact') result += generateFooterContact(c);
            if(c.type=='website') result += generateFooterWebsite(c);
            if(c.type=='address') result += generateFooterAddress(c);
        }
        return result;
    }
    function generateFlexBox(data){
        return  /*html*/`
        <div class="footer-section">
            <h4>${data.title}</h4>
            <div class="line"></div>
            <div>${data.text}</div>
            <div>${genComps(data.components)}</div>
        </div>`;
    }
    return footer.map(e=>generateFlexBox(e)).join('');
}

function genFooterLink(d){
    return  /*html*/`
        <a class="footerlink" target="_blank" href="${d.url}">
        ${d.title}
        </a>
    `
}

function generateFooterContact(d){
    return  /*html*/`
        <div class="icotext">
        <img src="contact.png">
        <div>
        ${d.title||''}<br>
        ${d.text||''}
        </div>
        </div>
    `;
}

function generateFooterWebsite(d){
    return  /*html*/`
        <div class="icotext">
        <img src="website.png">
        <div>
        ${d.title||''}<br>
        ${d.text||''}
        </div>
        </div>
    `;
}

function generateFooterAddress(d){
    return  /*html*/`
        <div class="icotext">
        <img src="address.png">
        <div>
        ${d.title||''}<br>
        ${d.text||''}
        </div>
        </div>
    `;
}
