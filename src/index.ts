require('dotenv').config();
const Discord = require('discord.js');
import {GearRank} from './GearRank';
import {PartyUp} from './PartyUp';
import {PartyOn} from './PartyOn';
import {Attendance} from './Attendance';
import { randomBytes } from 'crypto';

const client = new Discord.Client();
const TOKEN = process.env.TOKEN;

client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
  //let pu = new PartyOn({content: 'partyUp2 30 2', author: "me", tag: "mytag"});
  //pu.getValue();

});

//Routing method.  Each command should reach out to its corresponding class
client.on('message', (msg:any) => {
  if (msg.content === '.caphras') {
    msg.reply("https://docs.google.com/spreadsheets/d/1RhbTRme2VHseer7ae-oUTpk1Zc5gE4mhvfxyFCvhLns/edit?usp=sharing");
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
  /*.partyOn <nodeSize> <PAGroups> <Cannons>
    nodeSize i.e 30 
    PA groups i.e. 2
  */
  } else if(msg.content.startsWith('.partyOn')) {
    //list of allowed channels for this command
    let channelOkayList = ["bot-spam", "nodewar"];
    if(channelOkayList.indexOf(msg.channel.name) === -1) {
      return;
    }
    //add additional roles to this if needed.  Only Detox for now
    if(msg.member.roles.find((role:any) => role.name === "Lieutenant")){

      //Gear Rank google-spreadsheets
      let pu = new PartyOn(msg);
      pu.getValue();
    }
  } else  if (msg.content === '.attendance') {
    let channelOkayList = ["bot-spam", "nodewar"];
    if(channelOkayList.indexOf(msg.channel.name) === -1) {
      return;
    }
    if(msg.member.roles.find((role:any) => role.name === "Lieutenant")){
      //Gear Rank google-spreadsheets
      let attendance = new Attendance(msg);
      attendance.getValue();
    }
  //dad joker
  } else if(msg.content.startsWith("I'm ") || msg.content.startsWith("i'm ") || msg.content.startsWith('Im ') || msg.content.startsWith("im ")) {
    let joke:string[] = [];
    let random:number = Math.floor(Math.random() * 100);
    if(random >= 95) {
      if(msg.content.startsWith("I'm ")) {
        joke = msg.content.split("I'm ");
      } else if (msg.content.startsWith("i'm ")) {
        joke = msg.content.split("i'm ");
      } else if (msg.content.startsWith('Im ')) {
        joke = msg.content.split('Im ');
      } else if (msg.content.startsWith('im ')) {
        joke = msg.content.split('im ');
      }
      if(joke.length === 2){
        msg.channel.send("Hi, " + joke[1] + ". I'm Dad.");
      }
    }
  }
});