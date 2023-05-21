import puppeteer from "puppeteer";
const WEBSITE = (page = 1) => `https://www.christchurchcharleston.org/sermons/page/${page}`;

const getSermons = async () => {
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will in full width and height)
    const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    });

    let fetchSermons = true;
    let counter = 90;
    const allSermons = [];
    const page = await browser.newPage();

    while (fetchSermons) {
      // Open a new page
    
      // On this new page:
      // - open the "http://quotes.toscrape.com/" website
      // - wait until the dom content is loaded (HTML is ready)
      console.info(`fetching page ${counter}...`);

      await page.goto(WEBSITE(counter), {
        waitUntil: "domcontentloaded",
      });


    // Get page data
    const pageOfSermons = await page.evaluate(() => {
        const sermons = Array.from(document.querySelector('.all-sermons')?.children || []);
        const pagination = sermons.pop();
        const getSpeaker = (n) => {
            return n.innerText.replaceAll(/Speaker:\s/g, '');        
        }
    
        const getSeries = (n) => {
            return n.innerText.replaceAll(/Series:\s/g, '');        
        }
    
        const getScripture = (n) => {
            return n.innerText.replaceAll(/Passage:\s/g, '');        
        }

        // Convert the quoteList to an iterable array
        // For each quote fetch the text and author
        const hasNext = pagination && Array.from(pagination.querySelectorAll('a')).some(n => n.classList.contains('next'));
        const data = Array
            .from(sermons)
            .map((node) => {
                const title = node.querySelector('h3 a');
                const date = node.querySelector('.sermon-listing-date')
                const details = Array
                    .from(node.querySelector('.sermon-listing-details').children)
                    .reduce((acc, node) => {
                        if(node.classList.contains('sermon-speaker')) {
                            return { ...acc, speaker: getSpeaker(node) };
                        };
                        if (node.classList.contains('sermon-series')) {
                            return { ...acc, series: getSeries(node) };
                        }
                        if (node.classList.contains('sermon-scripture')) {
                            return { ...acc, scripture: getScripture(node) };
                        }
                        return acc;
                    }, {});

                return {
                    link: `https://www.christchurchcharleston.org${title.getAttribute('href')}`,
                    title: title.innerText,
                    date: date.innerText,
                    ...details
                };
            });

        return {
            data,
            hasNext
        }
    });
    allSermons.push(...pageOfSermons.data)
    fetchSermons = pageOfSermons.hasNext;
    counter++;
  }

  console.log(`Here are all the sermons`, {
    allSermons
  })

  await browser.close();

};

// Start the scraping
getSermons();