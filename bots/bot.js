// @ts-check
const { ActivityHandler, ActivityTypes, CardFactory, MessageFactory, TurnContext } = require('botbuilder');
const { updateConversationReferenceInDb } = require('../utils/database');

// You may customize this Welcome message to your liking.
const WELCOME_TEXT = 'Welcome to this Teams bot!';

// Create the bot class that extends the ActivityHandler class.
class MyTeamsBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            // send bot typing indicator before replying message
            await context.sendActivities([
                { type: ActivityTypes.Typing },
                // {type: 'delay', value: 1000},
            ]);

            // Check if recipent is the Bot, do not reply if not
            const botName = process.env.BOT_NAME;
            const recipientName = context.activity.recipient.name;

            // IMPORTANT: In group chat or channel, the recipient name is the bot name
            // Please keep the bot name defined in .env consistent with the name shown in Teams
            if (recipientName !== botName) {
                console.log('Not sent to bot in the message');
                return;
            }

            // If you need to do access control for the bot user, you can do it here

            // Update conversation reference in the database
            const conversationRefrence = TurnContext.getConversationReference(context.activity);
            await updateConversationReferenceInDb(conversationRefrence);

            const removedMentionText = TurnContext.removeRecipientMention(context.activity);
            if (removedMentionText) {
                // Remove the line break for command parsing
                const txt = removedMentionText.toLowerCase().replace(/\n|\r/g, '').trim();
                if (txt === '/command1') {
                    await context.sendActivity('You have triggered command 1!');
                }

                // To handle the raw message, you can use removedMentionText
                if (txt === '/cardtest') {
                    const card = CardFactory.adaptiveCard({
                        type: 'AdaptiveCard',
                        body: [
                            {
                                type: 'TextBlock',
                                size: 'Medium',
                                weight: 'Bolder',
                                text: 'This is a card title',
                            },
                            {
                                type: 'TextBlock',
                                text: 'This is a card content body',
                                wrap: true,
                            },
                        ],
                        actions: [
                            {
                                type: 'Action.OpenUrl',
                                title: 'Action button',
                                url: '${viewUrl}',
                            },
                        ],
                        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                        version: '1.6',
                    });
                    const cardMessage = MessageFactory.attachment(card);
                    await context.sendActivity(cardMessage);
                }
            }

            // Check value if it's submitted by a message card
            if (context.activity.value) {
                const from = context.activity.from;
                // eslint-disable-next-line no-unused-vars
                const messageId = context.activity.replyToId;
                const value = context.activity.value;
                console.log('Message is from: ' + from.name + ' Value:', value);
                console.log('replyToId: ', context.activity.replyToId);
                // Here you can add your logic to handle different card submissions
            }
            await next();
        });

        // Handle members being added to the conversation.
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded ?? [];
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    // await context.sendActivity(WELCOME_TEXT);
                    // const conversationRefrence = TurnContext.getConversationReference(context.activity);
                    // await updateConversationReferenceInDb(conversationRefrence);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // Handle installation update event
        this.onInstallationUpdate(async (context, next) => {
            // When the bot is installed to a team or personal scope, send a welcome message
            // TODO: Ensure to handle uninstall event if needed
            await context.sendActivity(WELCOME_TEXT);
            const conversationRefrence = TurnContext.getConversationReference(context.activity);
            await updateConversationReferenceInDb(conversationRefrence);
            await next();
        });
    }
}

module.exports.MyTeamsBot = MyTeamsBot;
