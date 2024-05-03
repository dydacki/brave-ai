import {TaskHandler} from './TaskHandler.ts';
import {WebClient} from '../clients/webClient.ts';
import {Friends} from '../model/taskModel.ts';
import {useChatOpenAI} from '../clients/langchainClient.ts';
import {SystemMessage} from 'langchain/schema';

// noinspection JSUnusedGlobalSymbols
export class OptimalDbHandler extends TaskHandler {
  private webClient: WebClient;
  private modelChat: any;
  private compressedFriends: Friends = {
    ania: [],
    stefan: [],
    zygfryd: [],
  };

  constructor() {
    super();
    this.modelChat = useChatOpenAI();
    this.webClient = new WebClient('https://tasks.aidevs.pl');
  }

  private async compressFriendChunk(friendDataChunk: string[]): Promise<string> {
    const prompt = `Transform string array into another comma-separated sentences with SAME AMOUNT OF ELEMENTS. Focus on facts. Make each sentence way more concise than array element, 
      so it carries the same information, but in a fewer words. Remove first name from input. Remove verbs when possible to retrieve them from context. 
      AVOID PERIODS at the end of sentences. When separating sentences with commas, do not use spaces between them\\n
      ###Example Input: Zygfryd: ["Mało osób wie, że Zygfryd był kiedyś mistrzem ortografii w szkole podstawowej.", "Jeden z ulubionych filmów Zygfryda to 'Matrix', który ogląda co najmniej dwa razy do roku."]
      ###Example Output: Mistrz ortografii w podstawówce,Ogląda ulubiony film Matrix 2x w roku###\\n`;

    const systemMessage = new SystemMessage(prompt);
    const userMessage = new SystemMessage(friendDataChunk.join('\n'));
    const response = await this.modelChat.invoke([systemMessage, userMessage]);
    return response.content;
  }

  private async compressFriends(friends: Friends) {
    let result: string = '';

    for (const friend of Object.keys(friends)) {
      const friendsName = friend as keyof Friends;
      const friendData = friends[friendsName];

      result += `${friendsName}: `;
      for (let i = 0; i < friendData.length; i += 5) {
        const friendDataElements = friendData.slice(i, i + 5);
        result += await this.compressFriendChunk(friendDataElements);
        result += ',';
      }

      result += '\n';
    }

    return result.trim();
  }

  async handleTask() {
    const friends: Friends = await this.webClient.get('/data/3friends.json');
    const compressed = await this.compressFriends(friends);

    const task = await this.getTask('optimaldb');
    if (task.code !== 0) {
      throw new Error(`Could not obtain optimal dv task`);
    }

    console.log(`Received task: ${JSON.stringify(task, null, 2)}`);
    const answer = {answer: compressed};
    const submitResponse = await this.submitAnswer(answer);
    console.log(`Received submit response: ${JSON.stringify(submitResponse, null, 2)}`);
  }
}
