const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../toxbot-google-creds.json');

type warStuctureType = { [key: string]: any};
const acceptableWarSize = ["30", "100"];
const WarStructure:warStuctureType = {
    "30": {
        "Main": 22,
        "Flex": 4,
        "Defense": 3,
        "Cannon": 1,
        "Anti-Cannon": 0
    },
    "100": {
        "Main": 60,
        "Flex": 20,
        "Defense": 7,
        "Cannon": 7,
        "Anti-Cannon": 6
    }
};

class PartyUp {
    message:any;
    nodeSize:string;
    paGroups:number;
    mainShotCallers:any[];
    flexShotCallers:any[];
    defenseShotCallers:any[];
    mainPlat:any[];
    mainPlat2:any[];
    mainPlat3:any[];
    mainPlat4:any[];
    flexPlat:any[];
    flexPlat2:any[];
    cannonPlat:any[];
    defensePlat:any[];
    anticannonPlat:any[];
    inGroup:any[];
    paGroup1:any[];
    paGroup2:any[];
    paGroup3:any[];

    mainMembers:number;
    flexMembers:number;
    defenseMembers:number;
    cannonMembers:number;
    anticannonMembers:number;

    constructor(message:any) {
        this.message = message;
        const args = this.message.content.split(' ');
        this.nodeSize = String(args[1]);
        this.paGroups = Number(args[2]);

        this.mainShotCallers=[];
        this.flexShotCallers=[];
        this.defenseShotCallers=[];
        this.mainPlat=[];
        this.mainPlat2=[];
        this.mainPlat3=[];
        this.mainPlat4=[];
        this.flexPlat=[];
        this.flexPlat2=[];
        this.cannonPlat=[];
        this.defensePlat=[];
        this.anticannonPlat=[];
        this.inGroup=[];
        this.paGroup1=[];
        this.paGroup2=[];
        this.paGroup3=[];

        this.mainMembers = 0;
        this.flexMembers = 0;
        this.defenseMembers = 0;
        this.cannonMembers = 0;
        this.anticannonMembers = 0;
    }

    async getValue():Promise<any> {
        //some basic weirdness checks
        if(!this.message && !this.message.author && !this.message.author.tag) {
            return;
        }
        console.log("@" + this.message.author.tag + " called: " + this.message);

        //validate the commands
        if(!this.nodeSize) {
            this.message.reply('nodeSize was not set or is not a number.  Format is: ```.partyUp <nodeSize(100)> <paGroups(3)> <cannonTeamSize(3)>```');
            return;
        } else if(!this.paGroups) {
            this.message.reply('paGroups was not set or is not a number.  Format is: ```.partyUp <nodeSize(100)> <paGroups(3)> <cannonTeamSize(3)>```');
            return;
        } 
        if(!WarStructure[this.nodeSize] || !WarStructure[this.nodeSize].Main) {
            this.message.reply('nodeSize is not an acceptable node size.  currentSizes are: ```' + acceptableWarSize.toString() + '```');
            return
        }

        //get members in the offense channel(will contain mercs)
        const warChannel = this.message.guild.channels.get('813570592237813798');
        let connectedMembers:string[] = [];
        warChannel.members.forEach((member:any) => {
            connectedMembers.push("@" + member.user.tag);
        });


        //TODO: REMOVE THIS LATER ADDING FOR TESTING
        // connectedMembers.push("@Diamond#1147");
        // connectedMembers.push("@biian#4199");
        // connectedMembers.push("@Borrador#0001");
        // connectedMembers.push("@Cadra#7845");
        // connectedMembers.push("@[66th] Hugoboss#5924");
        // connectedMembers.push("@FabAstronaut#9999");            
        // connectedMembers.push("@Cierra#7556");
        // connectedMembers.push("@Twinkie#2490");
        // connectedMembers.push("@Mentor5thForm#5918");
        // connectedMembers.push("@Henry#4358");
        // connectedMembers.push("@catinthehat#0266");
        // connectedMembers.push("@Jana#9114");
        // connectedMembers.push("@JoliPixy#2303");
        // connectedMembers.push("@Pwn#0002");
        // connectedMembers.push("@OldOak#1584");
        // connectedMembers.push("@OnRepeat#2819");
        // connectedMembers.push("@Cat Pettington#4715");    
        // connectedMembers.push("@Kelso#2403");
        // connectedMembers.push("@softnips#2705");
        // connectedMembers.push("@Conture#4678");
        // connectedMembers.push("@Toogar#1730");
        // connectedMembers.push("@Calamity#5423");
        // connectedMembers.push("@Vala#0001");
        // connectedMembers.push("@XeroZero0#5614");
        // connectedMembers.push("@tiger7512#5316");
        // connectedMembers.push("@ZecretSquirreL#1520");
        // connectedMembers.push("@testing#1234");

        //Access Detox Member Statistics
        const doc = new GoogleSpreadsheet('1Cr-GiObaSizG8jYvD5XBz9VEXdXK1o_f7kby9MI8xEI');
        await doc.useServiceAccountAuth(creds).catch((error:any) => {
            console.log(error);
        });
    
        await doc.loadInfo();
        let that = this;

        //Get the form submissions and currentMember data by row
        let currentMembers = doc.sheetsById[606827368];
        let rowOptions = {
        }
        let currentRows = await currentMembers.getRows(rowOptions);

        //get the main shotcallers from people in channel and sort by prio
        let preMainShotcallers:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if((row['platoon'] === "Main Shotcaller") && index !== -1){
                connectedMembers.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);

        //get the main platoon from people in channel and sort by prio
        let preMain:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if((row['platoon'] === "Main" || row['platoon'] === "DP") && index !== -1){
                connectedMembers.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);

        //get the flex shotcallers from people in channel and sort by prio
        let preFlexShotcaller:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if((row['platoon'] === "Flex Shotcaller") && index !== -1){
                connectedMembers.splice(index,1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);

        //get the flex platoon from people in channel and sort by prio
        let preflex:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if((row['platoon'] === "Flex" || row['platoon'] === "Anti-Cannon") && index !== -1){
                connectedMembers.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);

        //get the flex shotcallers from people in channel and sort by prio
        let preDefenseShotcaller:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if((row['platoon'] === "Defense Shotcaller") && index !== -1){
                connectedMembers.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);


        //get the defense platoon from people in channel
        let preDefense:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if(row['platoon'] === "Defense" && index !== -1){
                connectedMembers.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);

        //get the defense platoon from people in channel
        let preCannon:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if(row['platoon'] === "Cannon" && index !== -1){
                connectedMembers.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);

        //get the anticannon platoon from people in channel
        let preAnticannon:any[] = currentRows.filter((row:any) => {
            let index:number = connectedMembers.indexOf(row['Discord Tag']);
            if(row['platoon'] === "Anti-Cannon" && index !== -1){
                connectedMembers.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }).sort(this.sortGroupPriority);
        
        /*
        *  Platoon generation
        */

        //Get shotcallers in order
        //check if we have multiple mainball shotcallers
        if(preMainShotcallers.length > 1) {
            //check if we have no flex shotcaller
            if(preFlexShotcaller.length === 0){
                let flexBackups = preMainShotcallers.filter((row:any) => {
                    if(row['secondary Platoon'] === "Flex Shotcaller"){
                        return true;
                    } else {
                        return false;
                    }
                }).sort(this.sortGroupPriority);

                if(flexBackups.length) {
                    this.flexShotCallers.push(flexBackups[0]['Family Name']);
                    this.addToPlatoon(flexBackups[0]['Family Name'], "Flex");
                }                
            } else {
                preFlexShotcaller.forEach((row:any) => {
                    that.flexShotCallers.push(row['Family Name']);
                    that.addToPlatoon(row['Family Name'], "Flex");
                });
            }
        } else {
            preFlexShotcaller.forEach((row:any) => {
                that.flexShotCallers.push(row['Family Name']);
                that.addToPlatoon(row['Family Name'], "Flex");
            });
        }

        //run through remaining shotcallers and make sure they are not in flex
        preMainShotcallers.forEach((row:any) => {
            if(that.flexShotCallers.indexOf(row['Family Name']) === -1) {
                that.mainShotCallers.push(row['Family Name']);
                that.addToPlatoon(row['Family Name'], "Main");
            }
        });

        //Defense shotcaller isn't here
        if(preDefenseShotcaller.length === 0) {
            //get a list of potential defense shotcallers
            preMain.every((row: any) => {
                if(row['secondary Platoon'] === "Defense Shotcaller") {
                    that.defenseShotCallers.push(row['Family Name']);
                    that.addToPlatoon(row['Family Name'], "Defense");
                    preMain.splice(preMain.indexOf(row), 1);
                    return false;
                }
                return true;
            });
        } else {
            preDefenseShotcaller.forEach((row: any) => {
                that.defenseShotCallers.push(row['Family Name']);
                that.addToPlatoon(row['Family Name'], "Defense");
            });
        }

        //setup defense
        preDefense.forEach((row:any) => {
            //check to see if room in current war size
            if(that.defenseMembers < WarStructure[that.nodeSize].Defense) {
                that.addToPlatoon(row['Family Name'], "Defense");
            } else {
                if(that.getSquadMemberCount(row['secondary Platoon']) < WarStructure[that.nodeSize][row['secondary Platoon']]){
                    that.addToPlatoon(row['Family Name'], row['secondary Platoon']);
                } else {
                    that.addToPlatoon(row['Family Name'], "Main");
                }
                
            }
        });

        //setup Cannons
        preCannon.forEach((row:any) => {
            //check to see if room in current war size
            if(that.cannonMembers < WarStructure[that.nodeSize].Cannon) {
                that.addToPlatoon(row['Family Name'], "Cannon");
            } else {
                if(that.getSquadMemberCount(row['secondary Platoon']) < WarStructure[that.nodeSize][row['secondary Platoon']]){
                    that.addToPlatoon(row['Family Name'], row['secondary Platoon']);
                } else {
                    that.addToPlatoon(row['Family Name'], "Main");
                }
            }
        });

        //setup AntiCannons
        preAnticannon.forEach((row:any) => {
            //check to see if room in current war size
            if(that.anticannonMembers < WarStructure[that.nodeSize]['Anti-Cannon']) {
                that.addToPlatoon(row['Family Name'], "Anti-Cannon");
            } else {
                if(that.getSquadMemberCount(row['secondary Platoon']) < WarStructure[that.nodeSize][row['secondary Platoon']]){
                    that.addToPlatoon(row['Family Name'], row['secondary Platoon']);
                } else {
                    that.addToPlatoon(row['Family Name'], "Main");
                }
            }
        });

        //setup Flex
        preflex.forEach((row:any) => {
            //check to see if room in current war size
            if(that.flexMembers < WarStructure[that.nodeSize].Flex) {
                that.addToPlatoon(row['Family Name'], "Flex");
            } else {
                if(that.getSquadMemberCount(row['secondary Platoon']) < WarStructure[that.nodeSize][row['secondary Platoon']]){
                    that.addToPlatoon(row['Family Name'], row['secondary Platoon']);
                } else {
                    that.addToPlatoon(row['Family Name'], "Main");
                }
            }
        });

        //setup Main
        preMain.forEach((row:any) => {
            //check to see if room in current war size
            if(that.mainMembers < WarStructure[that.nodeSize].Main) {
                that.addToPlatoon(row['Family Name'], "Main");
            } else {
                if(that.getSquadMemberCount(row['secondary Platoon']) < WarStructure[that.nodeSize][row['secondary Platoon']]){
                    that.addToPlatoon(row['Family Name'], row['secondary Platoon']);
                } else {
                    that.addToPlatoon(row['Family Name'], "Main");
                }
            }
        });

        //setup PA groups
        let prePA = currentRows.filter((row:any) => {
            if((row['Class'] === "Wizard" || row['Class'] === "Witch") && (that.mainPlat.indexOf(row['Family Name']) >= 0 || that.mainPlat2.indexOf(row['Family Name']) >= 0 || that.mainPlat3.indexOf(row['Family Name']) >= 0 || that.mainPlat4.indexOf(row['Family Name']) >= 0 )) {
                return true;
            } else {
                return false;
            }
        });

        let maxPAGroupSize:number = Math.round(prePA.length / this.paGroups);
        prePA.sort(this.sortPAPriority).forEach((pa:any) => {
            if(that.paGroup1.length < maxPAGroupSize){
                this.paGroup1.push(pa['Family Name']);
            } else if(that.paGroup2.length < maxPAGroupSize) {
                this.paGroup2.push(pa['Family Name']);
            }else if(that.paGroup3.length < maxPAGroupSize) {
                this.paGroup3.push(pa['Family Name']);
            }
        })

        //this.message.channel.send("Main: ```" + this.mainPlat.sort().join(", ") + "``` Flex: ```" + this.flexPlat.sort().join(", ") + '``` Cannon: ```' + this.cannonPlat.sort().join(", ") + '``` Defense: ```' + this.defensePlat.sort().join(", ") + '```');
        
        //Generate Embed
        let fields = [];
        if(this.mainPlat.length) {
            fields.push({name: "Main Platoon 1", value: this.mainPlat.sort().join("\n"),inline:true})
        }
        if(this.mainPlat2.length) {
            fields.push({name: "Main Platoon 2", value: this.mainPlat2.sort().join("\n"),inline:true})
        }
        if(this.mainPlat3.length) {
            fields.push({name: "Main Platoon 3", value: this.mainPlat3.sort().join("\n"),inline:true})
        }
        if(this.mainPlat4.length) {
            fields.push({name: "Main Platoon 4", value: this.mainPlat4.sort().join("\n"),inline:true})
        }
        if(this.flexPlat.length) {
            fields.push({name: "Flex Platoon 1", value: this.flexPlat.sort().join("\n"),inline:true});
        }
        if(this.flexPlat2.length) {
            fields.push({name: "Flex Platoon 2", value: this.flexPlat2.sort().join("\n"),inline:true});
        }
        if(this.cannonPlat.length) {
            fields.push({name: "Cannon Platoon 1", value: this.cannonPlat.sort().join("\n"),inline:true});
        }
        if(this.defensePlat.length) {
            fields.push({name: "Defense Platoon 1", value: this.defensePlat.sort().join("\n"),inline:true});
        }
        if(this.paGroup1.length) {
            fields.push({name: "PA Group 1", value: this.paGroup1.sort().join("\n"),inline:true});
        }
        if(this.paGroup2.length) {
            fields.push({name: "PA Group 2", value: this.paGroup2.sort().join("\n"),inline:true});
        }
        if(this.paGroup3.length) {
            fields.push({name: "PA Group 3", value: this.paGroup3.sort().join("\n"),inline:true});
        }
        if(connectedMembers.length) {
            fields.push({name: "Merc or unknown name", value: connectedMembers.sort().join("\n"), inline:true});
        }

        console.log("partyUp call by: " + this.message.author.tag);
        this.message.channel.send({embed: {
            color: 0x00FF00,
            thumbnail: {
                url: 'https://i.imgur.com/XRIN9jb.png',
            },    
            title: "war:",
            "fields": fields,
            timestamp: new Date()
        }});

    }

    sortGroupPriority(a:any, b:any) {
        if(a['Group Priority'] === b['Group Priority']){ return 0}
        else {
            return (a['Group Priority'] < b['Group Priority']) ? -1 : 1;
        }
    }

    sortPAPriority(a:any, b:any) {
        if(a['PA Priority'] === b['PA Priority']){ return 0}
        else {
            return (a['PA Priority'] < b['PA Priority']) ? -1 : 1;
        }
    }

    addToPlatoon(familyName:string, platoon:string) {
        if(platoon === "Main") {
            if(this.inGroup.indexOf(familyName) === -1){
                if(this.mainPlat.length < 20) {
                    this.mainPlat.push(familyName);
                } else if (this.mainPlat2.length < 20) {
                    this.mainPlat2.push(familyName);
                } else if(this.mainPlat3.length < 20) {
                    this.mainPlat3.push(familyName);
                } else {
                    this.mainPlat4.push(familyName);
                }
                this.mainMembers++;
                this.inGroup.push(familyName);
            }
        } else if(platoon === "Flex") {
            if(this.inGroup.indexOf(familyName) === -1){
                if(this.flexPlat.length < 20) {
                    this.flexPlat.push(familyName);
                } else {
                    this.flexPlat2.push(familyName);
                }
                this.flexMembers++;
                this.inGroup.push(familyName);
            }
        } else if(platoon === "Defense") {
            if(this.inGroup.indexOf(familyName) === -1){
                this.defensePlat.push(familyName);
                this.defenseMembers++;
                this.inGroup.push(familyName);

            }
        } else if(platoon === "Cannon") {
            if(this.inGroup.indexOf(familyName) === -1){
                this.cannonPlat.push(familyName);
                this.cannonMembers++;
                this.inGroup.push(familyName);
            }
        } else if(platoon === "Anti-Cannon") {
            if(this.inGroup.indexOf(familyName) === -1){
                this.anticannonPlat.push(familyName);
                this.anticannonMembers++;
                this.inGroup.push(familyName);
            }
        } else {
            console.log("This user did not have a correct tag or is a merc: " + familyName)
        }
    }

    getSquadMemberCount(platName:string) {
        if(platName === "Flex") {
            return this.flexMembers;
        } else if(platName === "Defense"){
            return this.defenseMembers;
        } else if(platName === "Cannon") {
            return this.cannonMembers;
        } else if(platName === "Anti-Cannon") {
            return this.anticannonMembers;
        } else {
            return this.mainMembers;
        }
    }
}

export { PartyUp };
