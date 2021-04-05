require('dotenv').config();
const Discord = require('discord.js');
import {GearRank2} from './GearRank2';
import {PartyOn} from './PartyOn';
import {Attendance} from './Attendance';
import { SignUp } from './SignUp';
import { UpdateRoles } from './UpdateRoles';

import { Client, Intents } from "discord.js";
let intents = new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
export const client: Client = new Client({ ws: {intents: intents} });
const TOKEN = process.env.TOKEN;
const detoxRoleID = "802258465472380969";
const leadershipRoleID = "802258125125976105";

client.login(TOKEN);

client.on('ready', () => {
  if(client.user) 
    console.info(`Logged in as ${client.user.tag}!`);
  //let pu = new PartyOn({content: 'partyUp2 30 2', author: "me", tag: "mytag"}, client);
  //pu.getValue();

});

//Routing method.  Each command should reach out to its corresponding class
client.on('message', (msg:any) => {
  if (msg.content === '.caphras') {
    msg.reply("https://docs.google.com/spreadsheets/d/1RhbTRme2VHseer7ae-oUTpk1Zc5gE4mhvfxyFCvhLns/edit?usp=sharing");
  } else if(msg.content === '.warLifeskill') {
    msg.reply("To get 20 second repair time on a base.\n" + 
              "Level these skills, defense team will thank you:\n" +
              "Arti 1 Gather or Fishing Prof or Arti 1 in the other\n" + 
              "Arti 1 Hunting (takes 1 hour 300 energy w/exp buffs)\n" +
              "Master 1 Cooking (afk cook for 1 day)\n" + 
              "Master 1 Alchemy (afk alch for 1 day)\n" +
              "Procesing Arti 1 (just make flax cost like 100mil)");
    
    
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
    if(msg.member.roles.cache.find((role:any) => role.name === "Lieutenant")){

      //Gear Rank google-spreadsheets
      let pu = new PartyOn(msg, client);
      pu.getValue();
    }
  } else  if (msg.content === '.attendance') {
    let channelOkayList = ["bot-spam", "nodewar"];
    if(channelOkayList.indexOf(msg.channel.name) === -1) {
      return;
    }
    if(msg.member.roles.cache.find((role:any) => role.name === "Lieutenant")){
      //Gear Rank google-spreadsheets
      let attendance = new Attendance(msg);
      attendance.getValue();
    }
  //dad joker
  } else if(msg.content.startsWith("I'm ") || msg.content.startsWith("i'm ") || msg.content.startsWith('Im ') || msg.content.startsWith("im ")) {
    let joke:string[] = [];
    let random:number = Math.floor(Math.random() * 100);
    if(random >= 99) {
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
  } else if (msg.content.startsWith(".signUp")){
    if(msg.member.roles.cache.get(leadershipRoleID)){
      //sign up
      let signUp = new SignUp(client);
      signUp.startSignup(msg);
    }
  } else if (msg.content === '.gear'){
    //list of allowed channels for this command
    let channelOkayList = ["detox-and-friends", "special-teams", "gear-share", "guild-clips", "leadership", "officer-chat", "lieutenant-chat", "bot-spam"];
    if(channelOkayList.indexOf(msg.channel.name) === -1) {
      return;
    }

    //Gear Rank google-spreadsheets
    let gear2 = new GearRank2(client);
    gear2.getValue(msg);
  } else if (msg.content === ".UpdateProgressionRoles") {
    if(msg.member.roles.cache.get(leadershipRoleID)){
      //sign up
      let updateRoles = new UpdateRoles(client);
      updateRoles.startSignup(msg);
    }
  }
});