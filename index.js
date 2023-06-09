import puppeteer from "puppeteer";
const WEBSITE = (page = 1) => `https://www.sermonaudio.com/solo/woodruffroad/sermons/?page=${page}`;

const getSermons = async () => {
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will in full width and height)
    const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    });

    let fetchSermons = true;
    let counter = 118;
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
        const sermons = Array.from(document.querySelector('.solo-sermon-list')?.children || []);

        // Convert the quoteList to an iterable array
        // For each quote fetch the text and author
        const hasNext = sermons.length > 0;
        const data = Array
            .from(sermons)
            .map((node) => {
                const sermon = node.querySelector('.sermon-item-info a');
                const link = sermon.getAttribute('href');
                const title = sermon.innerText;
                const metadata = node.querySelector('.sermon-item-metadata');
                const speaker = metadata.querySelector('div:nth-of-type(1) a.accent-link')?.innerText || null;
                const date = metadata.querySelector('div:nth-of-type(2)')?.innerText || null;
                const scripture = metadata.querySelector('div:nth-of-type(3) a')?.innerText || null;
                const series = node.querySelector('.sermon-item-series a.accent-link')?.innerText || null;
                return {
                    link: `https://www.sermonaudio.com/${link}`,
                    title,
                    speaker,
                    date,
                    scripture,
                    series,
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