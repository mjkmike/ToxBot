const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../toxbot-google-creds.json');

class GearRank2 {
    client:any;

    constructor(client:any) {
        client
    }

    async getValue(message: any):Promise<any> {
        //some basic weirdness checks
        if(!message && !message.author && !message.author.tag) {
            console.log("something went wrong with the command message: ", message);
            return null;
        }
        let user:string = "@" + message.author.tag;
        console.log("gearRank2 call by: " + message.author.tag);

        if(message.member.roles.cache.get("802258605034176562")) {
            message.reply("This is a guild only feature, for guild members. <:spicy:824432764744761364>");
            return null;
        }

        //Access Detox Member Statistics
        const doc = new GoogleSpreadsheet('1Cr-GiObaSizG8jYvD5XBz9VEXdXK1o_f7kby9MI8xEI');
        await doc.useServiceAccountAuth(creds).catch((error:any) => {
            console.log(error);
        });
    
        await doc.loadInfo();

        //Get the form submissions and currentMember data by row
        let currentMembers = doc.sheetsById[606827368];
        let guildStats = doc.sheetsById[1818928035];
        let rowOptions = {
        }
        let currentRows = await currentMembers.getRows(rowOptions);

        let range = await guildStats.loadCells('H2:I8'); // loads a range of cells
        const memberCountCell = guildStats.getCellByA1('I2'); // or A1 style notation
        const memberCount = memberCountCell.value;

        let userRow = currentRows.filter((row:any)=> {
            if(row['Discord Tag'] === user) {
                return true;
            } else {
                return false;
            }
        });

        if(userRow.length !== 1) {
            message.reply("Something went wrong while looking up your name in the guild sheet.  Please let Leadership know.");
            const errorEmbed = {
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
                timestamp: new Date(),
            };
            message.author.send({embed: errorEmbed});
            return;
        }

        if(userRow[0]['AP'] == null) {
            message.reply("Something went wrong while looking up your name in the guild sheet.  Please let leadership know.");
            const errorEmbed = {
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
                timestamp: new Date(),
            };
            message.author.send({embed: errorEmbed});
            return;
        }

        let userAP:number = Number(userRow[0]['AP']);
        let userAAP:number = Number(userRow[0]['AAP']);
        let userDP:number = Number(userRow[0]['DP']);
        let userGS:number = Number(userRow[0]['GS']);
        let userAPRank:number = Number(userRow[0]['AP Rank']);
        let userAAPRank:number = Number(userRow[0]['AAP Rank']);
        let userDPRank:number = Number(userRow[0]['DP Rank']);
        let userGSRank:number = Number(userRow[0]['GS Rank']);
        let lastUpdated:string = userRow[0]['Last Updated'];
        let userGSProgressionRank:number = Number(userRow[0]['Progression Rank']);
        let firstUpdated:string = userRow[0]['First Updated'];
        let gsDifference:number = Number(userRow[0]['GS Difference']);

        

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
                    value: userAPRank + "/" + memberCount
                },
                {
                    name: 'AAP Rank',
                    value: userAAPRank + "/" + memberCount
                },
                {
                    name: 'DP Rank',
                    value: userDPRank + "/" + memberCount
                },
                {
                    name: 'GS Rank',
                    value: userGSRank + "/" + memberCount
                },
                {
                    name: 'Progression Rank',
                    value: userGSProgressionRank + "/" + memberCount
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Last updated:  ' + lastUpdated
            },
        };

        message.author.send({embed: gearEmbed});
        
        let messageContent:string = "It may be time to find an exploit. <:toxDeadInside:832358366021943306>";
        if(userGSRank === 1 ){
            messageContent = "May your enemies bow before you and the destructive power of your credit card.  <:toxEvil:832358365912629299>";
        } else if((userGSRank / memberCount) <= .1){
            messageContent = "This... This is what peak performance looks like. <:toxChad:832358365837525083>";
        } else if((userGSRank / memberCount) <= .2) {
            messageContent = "Those shoulders of yours sure do look tired. <:toxEZ:832358365937270784>";
        } else if((userGSRank / memberCount) <= .5) {
            messageContent = "Yup thats gear. <:toxLove:814517421388857354>";
        } else if((userGSRank / memberCount) <= .75) {
            messageContent = "Hmm we should keep at it.  Maybe even a little harder. <:toxSmart:832358365786800169>";
        }

        message.reply(messageContent).then((msg:any) => {
            msg.delete({ timeout: 60000})
            message.delete({ timeout: 60000});
        });
    }

    //javascript sort operator for AP
    sortAP(a:any, b:any) {
        if(a['AP (if you have multiple builds, choose your primary war set) Numbers Only'] === b['AP (if you have multiple builds, choose your primary war set) Numbers Only']){ return 0}
        else {
            return (a['AP (if you have multiple builds, choose your primary war set) Numbers Only'] > b['AP (if you have multiple builds, choose your primary war set) Numbers Only']) ? -1 : 1;
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

export { GearRank2 };
