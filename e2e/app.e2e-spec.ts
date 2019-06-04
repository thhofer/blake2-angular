import {AppPage} from './app.po';

describe('blake2-angular App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    const paragraphText = await page.getParagraphText();
    expect(paragraphText).toEqual('Welcome to Blake2-angular demo!');
  });
});
