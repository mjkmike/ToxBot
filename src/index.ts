require('dotenv').config();
const Discord = require('discord.js');
import {GearRank} from './GearRank';
import {PartyUp} from './PartyUp';

const client = new Discord.Client();
const TOKEN = process.env.TOKEN;

client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

//Routing method.  Each command should reach out to its corresponding class
client.on('message', (msg:any) => {
  if (msg.content === 'ping') {
    //msg.reply('pong');
  } else if(msg.content.startsWith('.gear')) {
    //list of allowed channels for this command
    let channelOkayList = ["bot-spam", "guild-chat", "special-teams", "gear-share", "guild-clips", "leadership", "officer-chat", "lieutenant-chat"];
    if(channelOkayList.indexOf(msg.channel.name) === -1) {
      return;
    }
    //add additional roles to this if needed.  Only Detox for now
    if(msg.member.roles.find((role:any) => role.name === "Detox")){

      //Gear Rank google-spreadsheets
      let gear = new GearRank(msg);
      gear.getValue();
    }
  /*.partUp <nodeSize> <PAGroups> <Cannons>
    nodeSize i.e 30 
    PA groups i.e. 2
  */
  } else if(msg.content.startsWith('.partyUp')) {
    //list of allowed channels for this command
    let channelOkayList = ["bot-spam"];
    if(channelOkayList.indexOf(msg.channel.name) === -1) {
      return;
    }
    //add additional roles to this if needed.  Only Detox for now
    if(msg.member.roles.find((role:any) => role.name === "Detox")){

      //Gear Rank google-spreadsheets
      let gear = new PartyUp(msg);
      gear.getValue();
    }
  }
});