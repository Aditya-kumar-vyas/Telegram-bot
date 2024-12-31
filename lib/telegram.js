const Telegrambot = require('node-telegram-bot-api');

require('dotenv').config();
const token = process.env.TOKEN
console.log(token);

const bot = new Telegrambot(token, {polling: true});


bot.on('message',(msg)=>{
    console.log('Your chat id',msg.chat.id,msg);    


    bot.stopPolling();
})

const sendMessage= async (chatId,message)=>{
    try{
        await bot.sendMessage(chatId,message);
        console.log('Message sent');
    }catch(e){
        console.log(e);
    }
}
module.exports = {sendMessage};
