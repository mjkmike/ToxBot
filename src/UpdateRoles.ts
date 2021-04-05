const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../toxbot-google-creds.json');

const detoxRoleID = "802258465472380969";
const nwChannelID = "817980179443744798";

class UpdateRoles {
    client:any;

    constructor(client: any) {
        this.client = client;
    }

    async startSignup(msg: any):Promise<any> {


        //some basic weirdness checks
        if(!msg && !msg.author && !msg.author.tag) {
            console.log("something went wrong with the command message: ", msg);
            return null;
        }
        let user:string = "@" + msg.author.tag;
        console.log("UpdateRoles call by: " + msg.author.tag);


        // //Access Detox Member Statistics
        const doc = new GoogleSpreadsheet('1Cr-GiObaSizG8jYvD5XBz9VEXdXK1o_f7kby9MI8xEI');
        await doc.useServiceAccountAuth(creds).catch((error:any) => {
            console.log(error);
        });
    
        await doc.loadInfo();

        //Get the form submissions and currentMember data by row
        let currentMembers = doc.sheetsById[606827368];
        let rowOptions = {
        }
        let currentRows = await currentMembers.getRows(rowOptions);

        let top5:any[] = [];
        let top1:any[] = [];
        
        currentRows.forEach((row:any) => {
            if(row['Progression Rank'] === "1") {
                console.log(row['Family Name'] + ": " + row['Progression Rank']);
                top5.push(row['Discord Tag']);
                top1.push(row['Discord Tag']);
            } else if (Number(row['Progression Rank']) > 1 && Number(row['Progression Rank']) <= 5) {
                console.log(row['Family Name'] + ": " + row['Progression Rank']);
                top5.push(row['Discord Tag']);
            } else {
                //do nothing
            }
        });

        let serverMembers = await msg.guild.members.fetch();
        let toxicGear = await msg.guild.roles.fetch('826945422975041628', false, true);
        toxicGear.members.each((user:any)=> {
            //onsole.log(user.roles.cache.get('826945422975041628'));
            user.roles.remove('826945422975041628');
        });

        let gearGod = await msg.guild.roles.fetch('826945261783089182', false, true);
        gearGod.members.each((user:any)=> {
            //console.log(user.roles.cache.get('826945261783089182'));
            user.roles.remove('826945261783089182');
        })

        //console.log("test");

        serverMembers.each((member:any)=> {
            if(top5.indexOf("@" + member.user.tag) !== -1) {
                member.roles.add('826945422975041628');
                //console.log("add toxicgear:" + member.user.tag);
            }

            if(top1.indexOf("@" + member.user.tag) !== -1) {
                member.roles.add('826945261783089182');
                //console.log("add gearGod:" + member.user.tag);
            }
        });
    }
}

export { UpdateRoles };
