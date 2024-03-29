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
  } else if(msg.content === '.warLifeskill' || msg.content === '.repair' || msg.content === '.repairTime') {
    msg.reply("https://imgur.com/90ziViS.png");
  } else if(msg.content === '.helpDesk') {
    msg.reply("https://docs.google.com/spreadsheets/d/18T-U3LWjRJnJ6ictC9FFsRNuImrf1MwBoGnRDpkntCM/edit#gid=588360962");
  } else if(msg.content === '.brackets') {
    msg.reply('https://i.imgur.com/oVJmdny.png');
  } else if (msg.content === '.attendancesheet') {
    msg.reply("https://docs.google.com/spreadsheets/d/119Kj0SsjZ3jz7VgcHODCOvGxIRDgIfFkTqvWqXXoFe8/edit?usp=sharing");
  } else if(msg.content === ".cron") {
    msg.reply("https://i.imgur.com/jFQOk3h.png");
  // }else if(msg.content.startsWith('.partyOn')) {
  //   //list of allowed channels for this command
  //   let channelOkayList = ["bot-spam", "nodewar"];
  //   if(channelOkayList.indexOf(msg.channel.name) === -1) {
  //     return;
  //   }
  //   //add additional roles to this if needed.  Only Detox for now
  //   if(msg.member.roles.cache.find((role:any) => role.name === "Lieutenant")){

  //     //Gear Rank google-spreadsheets
  //     let pu = new PartyOn(msg, client);
  //     pu.getValue();
  //   }
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
    let channelOkayList = ["802260548652761138", "802431784401764372", "802259891191414814", "802267304901083136", "808875967971459152", "802270257346510908"];
    if(channelOkayList.indexOf(msg.channel.id) === -1) {
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