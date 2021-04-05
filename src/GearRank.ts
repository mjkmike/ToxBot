const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../toxbot-google-creds.json');

class GearRank {
    message:any;

    constructor(message:any) {
        this.message = message;
    }

    async getValue():Promise<any> {
        //some basic weirdness checks
        if(!this.message && !this.message.author && !this.message.author.tag) {
            console.log("something went wrong with the command message: ", this.message);
            return null;
        }
        let user:string = "@" + this.message.author.tag;
        console.log("gearRank call by: " + this.message.author.tag);

        if(this.message.member.roles.get("802258605034176562")) {
            this.message.reply("This is a guild only feature, for guild members. <:spicy:824432764744761364>");
            return null;
        }

        //Access Detox Member Statistics
        const doc = new GoogleSpreadsheet('1Cr-GiObaSizG8jYvD5XBz9VEXdXK1o_f7kby9MI8xEI');
        await doc.useServiceAccountAuth(creds).catch((error:any) => {
            console.log(error);
        });
    
        await doc.loadInfo();

        //Get the form submissions and currentMember data by row
        let formData = doc.sheetsById[1944439561];
        let currentMembers = doc.sheetsById[606827368];
        let rowOptions = {
        }
        let rows = await formData.getRows(rowOptions);
        let currentRows = await currentMembers.getRows(rowOptions);

        //Get a current list of all currentMembers by discord tag
        let currentMembersList:string[] = [];
        currentRows.forEach((row:any) => {
            let discordTag = row['Discord Tag'];
            if(discordTag){
                currentMembersList.push(discordTag);
            }
        });

        let userAP:number = 0;
        let userAAP:number = 0;
        let userDP:number = 0;
        let userGS:number = 0;
        let lastUpdated:string = "";
        let firstAP:number = 0;
        let firstAAP:number = 0;
        let firstDP:number = 0;
        let firstGS:number = 0;
        let firstUpdated:string = "";
        let guildGS:any = {};
        let gsDifference:number = 0;

        //current gear & first gear
        rows.forEach((row:any) => {
            if(currentMembersList.indexOf(row['Discord Tag']) === -1){
                return;
            }
            let ap:number = Number(row['AP (if you have multiple builds, choose your primary war set) Numbers Only']);
            let aap:number = Number(row['Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only']);
            let dp:number = Number(row['DP (if you have multiple builds, choose your primary war set) Numbers Only']);
            if(user == row['Discord Tag']){
                //set the first submission a member had
                if(firstAP === 0) {
                    firstAP = Number(row['AP (if you have multiple builds, choose your primary war set) Numbers Only']);
                    firstAAP = Number(row['Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only']);
                    firstDP = Number(row['DP (if you have multiple builds, choose your primary war set) Numbers Only']);
                    firstUpdated = row['Timestamp'];
                    if(firstAP > firstAAP) {
                        firstGS = firstAP;
                    } else {
                        firstGS = firstAAP;
                    }
                    firstGS = firstGS + firstDP;
                }
                
                userAP = Number(row['AP (if you have multiple builds, choose your primary war set) Numbers Only']);
                userAAP = Number(row['Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only']);
                userDP = Number(row['DP (if you have multiple builds, choose your primary war set) Numbers Only']);
                lastUpdated = row['Timestamp'];

                if(userAP > userAAP) {
                    userGS = userAP;
                } else {
                    userGS = userAAP;
                }
                userGS = userGS + userDP;

                if(firstGS === userGS){
                    gsDifference == 0;
                } else {
                    gsDifference = userGS - firstGS;
                }
            }

            //add up guild gs
            let gs:number = 0;
            if(ap > aap) {
                gs = ap;
            } else {
                gs = aap;
            }
            gs = gs + dp;
            guildGS[row['Discord Tag']] = gs;
            //guildGS.push(gs);
        });

        let recentRows:any[] = [];
        let mostRecentNames:any[] = [];
        rows.forEach((row:any) => {
            //not in current members
            if(currentMembersList.indexOf(row['Discord Tag']) === -1){
                return;
            }

            if(mostRecentNames.indexOf(row['Discord Tag']) === -1) {
                recentRows.push(row);
                mostRecentNames.push(row['Discord Tag']);
            } else if(mostRecentNames.indexOf(row['Discord Tag']) >= 0){
                if(Date.parse(row['Timestamp']) > Date.parse(recentRows[mostRecentNames.indexOf(row['Discord Tag'])]['Timestamp'])) {
                    recentRows[mostRecentNames.indexOf(row['Discord Tag'])] = row;
                } else {
                    //console.log('times did weirdness');
                }    
            } else {
                //console.log("something went wrong in recent rows");
            }
        });

        //ap rank
        let apSorted = recentRows.sort(this.sortAP);
        let apTrimmed = this.removeSingleDupe(apSorted, 'AP (if you have multiple builds, choose your primary war set) Numbers Only', userAP.toString());
        let apRank = apTrimmed.indexOf(userAP.toString()) + 1;
        
        //aap rank
        let aapSorted = recentRows.sort(this.sortAAP);
        let aapTrimmed = this.removeSingleDupe(aapSorted, 'Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only', userAAP.toString());
        let aapRank = aapTrimmed.indexOf(userAAP.toString()) + 1;

        //dp rank
        let dpSorted = recentRows.sort(this.sortDP);
        let dpTrimmed = this.removeSingleDupe(dpSorted, 'DP (if you have multiple builds, choose your primary war set) Numbers Only', userDP.toString());
        let dpRank = dpTrimmed.indexOf(userDP.toString()) + 1;

        //gs rank
        let gsTrimmed:number[] = [];
        for (const username in guildGS){
            if(username === user) {
                gsTrimmed.push(guildGS[username]);
            } else if (guildGS[user] != guildGS[username]) {
                gsTrimmed.push(guildGS[username]); 
            } else {
                //console.log('hmm');
            }
        }
        gsTrimmed = gsTrimmed.sort().reverse();
        let gsRank = gsTrimmed.indexOf(userGS) + 1;

        const gearEmbed = {
            color: 0x00FF00,
            title: user + '\'s ranking',
            author: {
                name: 'Detox Gear Rankings',
                icon_url: 'https://i.imgur.com/XRIN9jb.png',
                url: 'https://discord.gg/ZSwazAkQYq',
            },
            description: 'Use the URL below to update sheet: ' + "https://forms.gle/xsQHqkjjQEnbzXmHA",
            thumbnail: {
                url: 'https://i.imgur.com/XRIN9jb.png',
            },
            fields: [
                {
                    name: 'Current Gear on Sheet',
                    value: userAP + "/" + userAAP + "/" + userDP,
                },
                {
                    name: 'GS Progress Since Earliest Update on Sheet: ' + firstUpdated,
                    value: gsDifference,
                },
                {
                    name: 'AP Rank',
                    value: apRank + "/" + currentMembersList.length
                },
                {
                    name: 'AAP Rank',
                    value: aapRank + "/" + currentMembersList.length
                },
                {
                    name: 'DP Rank',
                    value: dpRank + "/" + currentMembersList.length
                },
                {
                    name: 'GS Rank',
                    value: gsRank + "/" + currentMembersList.length
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Last updated:  ' + lastUpdated
            },
        };

        //this.message.channel.send({embed: gearEmbed});
        console.log("GS Rank-" + gsRank + " AP Rank-" + apRank + " AAP Rank-" + aapRank + " DP Rank-" + dpRank + " progress-" + gsDifference)
        this.message.author.send({embed: gearEmbed});
        
        let message = this.message;
        let messageContent:string = "It may be time to find an exploit. <a:weirdWalkAway:817066234344505354>";
        if((gsRank / currentMembersList.length) <= .1){
            messageContent = "WOW~ Thats a lot of damage.  You deserve a break why don't you maybe take a walk outside. <:pepeFeelsGamer:817066986285563995>";
        } else if((gsRank / currentMembersList.length) <= .2) {
            messageContent = "Those shoulders of yours sure do look tired.<a:salute:817065842227150858>";
        } else if((gsRank / currentMembersList.length) <= .5) {
            messageContent = "Yup thats gear.<:toxLove:814517421388857354>";
        } else if((gsRank / currentMembersList.length) <= .75) {
            messageContent = "Hmm we should keep at it.  Maybe even a little harder. <:toxHype:814517420848971787>";
        }

        this.message.reply(messageContent).then((msg:any) => {
            msg.delete(60000)
            message.delete(60000);
        });
    }

    //javascript sort operator for AP
    sortAP(a:any, b:any) {
        if(a['AP (if you have multiple builds, choose your primary war set) Numbers Only'] === b['AP (if you have multiple builds, choose your primary war set) Numbers Only']){ return 0}
        else {
            return (a['AP (if you have multiple builds, choose your primary war set) Numbers Only'] > b['AP (if you have multiple builds, choose your primary war set) Numbers Only']) ? -1 : 1;
        }
    }

    //javascript sort operator for AAP
    sortAAP(a:any, b:any) {
        if(a['Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only'] === b['Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only']){ return 0}
        else {
            return (a['Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only'] > b['Awakened AP (if you have multiple builds, choose your primary war set) Numbers Only']) ? -1 : 1;
        }
    }

    //javascript sort operator for DP
    sortDP(a:any, b:any) {
        if(a['DP (if you have multiple builds, choose your primary war set) Numbers Only'] === b['DP (if you have multiple builds, choose your primary war set) Numbers Only']){ return 0}
        else {
            return (a['DP (if you have multiple builds, choose your primary war set) Numbers Only'] > b['DP (if you have multiple builds, choose your primary war set) Numbers Only']) ? -1 : 1;
        }
    }

    //javascript sort operator for DP
    sortSubmission(a:any, b:any) {
        if(a['DP (if you have multiple builds, choose your primary war set) Numbers Only'] === b['DP (if you have multiple builds, choose your primary war set) Numbers Only']){ return 0}
        else {
            return (a['DP (if you have multiple builds, choose your primary war set) Numbers Only'] > b['DP (if you have multiple builds, choose your primary war set) Numbers Only']) ? -1 : 1;
        }
    }

    keepMostRecent(data:any[]): any {
        let returnData:any[] = [];

    }

    //removes duplicate values in an array
    removeDupe(data:any[], arrayIndex:string):any {
        let currentValue:any;
        let returnData:any[] = [];
        data.forEach((row:any) => {
            if(currentValue != row[arrayIndex]) {
                returnData.push(row[arrayIndex]);
            }
            currentValue = row[arrayIndex];
        })
        return returnData;
    }

    //removes duplicate value in an array
    removeSingleDupe(data:any[], arrayIndex:string, valueToRemove:string):any {
        let returnData:any[] = [];
        let usedOnce:boolean = false;
        data.forEach((row:any) => {
            if(valueToRemove == row[arrayIndex] && usedOnce == false){
                returnData.push(row[arrayIndex]);
                usedOnce = true;
            } else if(valueToRemove != row[arrayIndex]) {
                returnData.push(row[arrayIndex]);
            } else {
                //console.log("something happened");
            }
        })
        return returnData;
    }
}

export { GearRank };
