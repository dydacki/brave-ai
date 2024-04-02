import {PlaywrightWebBaseLoader, Page, Browser} from 'langchain/document_loaders/web/playwright';

export const usePlaywright = (url: string): PlaywrightWebBaseLoader => {
  return new PlaywrightWebBaseLoader(url, {
    launchOptions: {
      headless: true,
      timeout: 60000,
    },
    gotoOptions: {
      waitUntil: 'networkidle',
    },
  });
};
